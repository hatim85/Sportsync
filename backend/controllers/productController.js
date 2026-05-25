import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import { errorHandler } from '../utils/error.js';
import { getMakingCharge, applyMakingChargeToProductDoc } from "../utils/pricing.js";
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { cloudinary } from '../utils/multer.js';

const UPLOAD_DIR = path.resolve(process.cwd(), '../frontend/public');

/**
 * Delete image files from the public folder.
 * Silently ignores files that don't exist.
 */
async function deleteImageFiles(filenames) {
    for (const filename of filenames) {
        if (!filename) continue;
        
        if (filename.includes('cloudinary.com')) {
            try {
                const parts = filename.split('/');
                const file = parts.pop();
                const folder = parts.pop();
                const publicId = `${folder}/${file.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
                console.log(`[deleteImageFiles] Cloudinary deleted: ${publicId}`);
            } catch (err) {
                console.error(`[deleteImageFiles] Cloudinary delete error:`, err);
            }
        } else {
            const filePath = path.join(UPLOAD_DIR, filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`[deleteImageFiles] Failed to delete ${filePath}:`, err.message);
                } else {
                    console.log(`[deleteImageFiles] Successfully deleted: ${filename}`);
                }
            });
        }
    }
}

const router = express.Router();

export const getProducts = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const requestedLimit = parseInt(req.query.limit, 10);
        const pageSize = Number.isFinite(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 100)
            : 10;
        const skip = (page - 1) * pageSize;

        const sort = req.query.sort;
        let sortOption = { createdAt: -1 }; // Default to newest

        if (sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'trending') {
            sortOption = { featured: -1, reviewsCount: -1, rating: -1, createdAt: -1 };
        }
        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .sort(sortOption)
            .populate('categoryId', 'name')
            .skip(skip)
            .limit(pageSize);
        
        const makingCharge = await getMakingCharge();
        const response = products.map(p => applyMakingChargeToProductDoc(p, makingCharge));
        res.status(200).json({ products: response, totalProducts });
    } catch (err) {
        next(err);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId).populate('categoryId', 'name');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // const category = product.categoryName;

        const makingCharge = await getMakingCharge();
        const priced = applyMakingChargeToProductDoc(product, makingCharge);

        let userCanReview = false;
        let eligibleOrderId = null;
        const userId = req.query.userId;
        if (userId) {
            const deliveredOrders = await Order.find({
                userId,
                status: 'delivered',
                'products.productId': product._id,
            })
                .sort({ deliveredAt: -1 })
                .select('_id');

            for (const ord of deliveredOrders) {
                const reviewed = await Review.exists({
                    userId,
                    orderId: ord._id,
                    productId: product._id,
                });
                if (!reviewed) {
                    userCanReview = true;
                    eligibleOrderId = ord._id;
                    break;
                }
            }
        }

        res.status(200).json({
            ...priced,
            userCanReview,
            eligibleOrderId,
        });
    } catch (err) {
        next(err);
    }
};


export const createProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, categoryId, stock, coverImageIndex } = req.body;
    const imageFiles = (req.files || []).map(file => file.path).slice(0, 4);

    let coverIdx = 0;
    if (coverImageIndex !== undefined && imageFiles.length > 0) {
        const idx = Number(coverImageIndex);
        if (!Number.isNaN(idx) && idx >= 0 && idx < imageFiles.length) {
            coverIdx = idx;
        }
    }

    try {
        const normalizedName = String(name || '').trim();
        if (!normalizedName) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingProduct = await Product.findOne({
            name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' }
        }).exec();
        if (existingProduct) {
            return res.status(400).json({ error: 'Product with this name already exists' });
        }

        let category;
        const normalizedCat = String(categoryId || '').trim();
        if (mongoose.Types.ObjectId.isValid(normalizedCat)) {
            category = await Category.findById(normalizedCat);
        } else if (normalizedCat) {
            category = await Category.findOne({ name: { $regex: `^${normalizedCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
            if (!category) {
                category = new Category({ name: normalizedCat });
                await category.save();
            }
        }

        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        const newProduct = new Product({
            name: normalizedName,
            description,
            price,
            stock,
            image: imageFiles,
            coverImageIndex: coverIdx,
            categoryId: category._id,
            categoryName: category.name
        });
        const savedProduct = await newProduct.save();

        category.products.push(savedProduct._id);
        await category.save();

        res.status(201).json(savedProduct);
    } catch (err) {
        next(err);
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, description, price, categoryId, stock, coverImageIndex } = req.body;

        const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (name !== undefined) {
            const normalizedName = String(name || '').trim();
            if (!normalizedName) {
                return res.status(400).json({ message: 'Name is required' });
            }
            const existingProduct = await Product.findOne({
                _id: { $ne: productId },
                name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' }
            }).exec();
            if (existingProduct) {
                return res.status(400).json({ message: 'Product with this name already exists' });
            }
            product.name = normalizedName;
        }

        let newCategoryDoc;
        const normalizedCatInput = String(categoryId || '').trim();
        if (normalizedCatInput) {
            if (mongoose.Types.ObjectId.isValid(normalizedCatInput)) {
                newCategoryDoc = await Category.findById(normalizedCatInput);
            } else {
                newCategoryDoc = await Category.findOne({ name: { $regex: `^${normalizedCatInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
                if (!newCategoryDoc) {
                    newCategoryDoc = new Category({ name: normalizedCatInput });
                    await newCategoryDoc.save();
                }
            }
        }

        if (newCategoryDoc && String(newCategoryDoc._id) !== String(product.categoryId)) {
            const oldCategory = await Category.findById(product.categoryId);

            if (oldCategory) {
                oldCategory.products = oldCategory.products.filter(prodId => prodId.toString() !== productId);
                await oldCategory.save();
            }

            product.categoryId = newCategoryDoc._id;
            newCategoryDoc.products.push(productId);
            await newCategoryDoc.save();

            product.categoryName = newCategoryDoc.name;
        }

        if (description) product.description = description;
        if (price) product.price = price;
        if (stock !== undefined) product.stock = stock;

        // Handle explicitly removed images (sent by frontend as JSON array of filenames)
        if (req.body.removedImages) {
            try {
                const imagesToRemove = JSON.parse(req.body.removedImages);
                if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
                    // Delete the files from disk
                    deleteImageFiles(imagesToRemove);
                    // Remove them from the product's image array
                    product.image = product.image.filter(img => !imagesToRemove.includes(img));
                }
            } catch (e) {
                console.error('Failed to parse removedImages:', e.message);
            }
        }

        // Handle new uploaded images
        if (req.files && req.files.length > 0) {
            const oldImages = [...product.image]; // snapshot before update
            const newImageUrls = req.files.map(file => file.path);
            product.image = [...product.image, ...newImageUrls].slice(-4); // keep latest up to 4

            // Delete old images that are no longer in the updated list (pushed out by limit)
            const pushedOut = oldImages.filter(img => !product.image.includes(img));
            deleteImageFiles(pushedOut);
        }

        if (coverImageIndex !== undefined) {
            const idx = Number(coverImageIndex);
            if (!Number.isNaN(idx) && idx >= 0 && idx < product.image.length) {
                product.coverImageIndex = idx;
            }
        }


        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
    } catch (err) {
        next(err);
    }
}


export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const categoryId = product.categoryId;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const category = await Category.findById(categoryId);
        if (category) {
            category.products = category.products.filter(productId => productId.toString() !== req.params.productId);
            await category.save();
        }

        // Delete all product images from the public folder
        deleteImageFiles(product.image);

        await Product.deleteOne({ _id: req.params.productId });
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const sort = req.query.sort;
        let sortOption = { createdAt: -1 }; // Default to newest

        if (sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        let query = {};
        if (categoryId && categoryId !== 'all') {
            let actualId = categoryId;
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                const cat = await Category.findOne({ name: { $regex: `^${categoryId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
                if (cat) {
                    actualId = cat._id;
                } else {
                    // If name not found and not a valid ID, return empty results instead of crashing
                    return res.status(404).json({ success: false, message: 'Category not found' });
                }
            }
            query = { categoryId: actualId };
        }

        const products = await Product.find(query)
            .sort(sortOption)
            .populate('categoryId', 'name')
            .exec();
        const makingCharge = await getMakingCharge();
        const priced = products.map(p => applyMakingChargeToProductDoc(p, makingCharge));
        res.json({ success: true, products: priced });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const search = async (req, res) => {
    const query = req.params.q;
    try {
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid search query');
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const requestedLimit = parseInt(req.query.limit, 10);
        const pageSize = Number.isFinite(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 500)
            : 12;
        const skip = (page - 1) * pageSize;

        const sort = req.query.sort;
        let sortOption = { createdAt: -1 };

        if (sort === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        };

        const totalProducts = await Product.countDocuments(filter);
        const results = await Product.find(filter)
            .sort(sortOption)
            .populate('categoryId')
            .skip(skip)
            .limit(pageSize);

        const makingCharge = await getMakingCharge();
        const priced = results.map((p) => applyMakingChargeToProductDoc(p, makingCharge));

        res.status(200).json({ products: priced, totalProducts, page, pageSize });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const similarProduct = async (req, res) => {
    req.query.tab = req.query.tab || 'recommended';
    return getRelatedByTab(req, res);
};

export const getRelatedByTab = async (req, res) => {
    try {
        const { productId } = req.params;
        const tab = req.query.tab || 'recommended';
        const currentProduct = await Product.findById(productId);

        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const catId = currentProduct.categoryId;
        let query = { _id: { $ne: productId } };
        let sortOption = { createdAt: -1 };

        switch (tab) {
            case 'recommended':
                query.categoryId = catId;
                sortOption = { featured: -1, reviewsCount: -1, createdAt: -1 };
                break;
            case 'category':
                query.categoryId = catId;
                sortOption = { createdAt: -1 };
                break;
            case 'classic':
                sortOption = { createdAt: 1 };
                break;
            case 'more': {
                const accCat = await Category.findOne({
                    $or: [
                        { slug: 'accessories' },
                        { name: { $regex: /^accessories$/i } }
                    ]
                });
                if (accCat) {
                    query.categoryId = accCat._id;
                } else {
                    query.categoryId = { $ne: catId };
                }
                sortOption = { createdAt: -1 };
                break;
            }
            default:
                query.categoryId = catId;
        }

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(12)
            .populate('categoryId', 'name');

        const makingCharge = await getMakingCharge();
        const priced = products.map((p) => applyMakingChargeToProductDoc(p, makingCharge));
        res.json(priced);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
};

export const updateImages = async (req, res) => {
    const { productId } = req.params;
    const images = req.files || [];
    const filenames = images.map(item => item.path).slice(0, 4);

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete old images that are being replaced
        const removedImages = product.image.filter(img => !filenames.includes(img));
        deleteImageFiles(removedImages);

        product.image = filenames;
        if (product.coverImageIndex >= product.image.length) {
            product.coverImageIndex = 0;
        }

        const updatedImage = await product.save();
        res.json(updatedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const validate = (method) => {
    switch (method) {
        case 'createProduct': {
            return [
                body('name', 'Name is required').trim().notEmpty(),
                body('description', 'Description is required').trim().notEmpty(),
                body('price', 'Price is required').isNumeric().notEmpty(),
                body('categoryId', 'Category is required').trim().notEmpty()
            ];
        }
        case 'updateProduct': {
            return [
                body('name', 'Name is required').optional().trim().notEmpty(),
                body('description', 'Description is required').optional().trim().notEmpty(),
                body('price', 'Price is required').optional().isNumeric().notEmpty(),
                body('categoryId', 'Category is required').optional().trim().notEmpty()
            ];
        }
    }
}