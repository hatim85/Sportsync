import { errorHandler } from "../utils/error.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
import { cloudinary } from "../utils/multer.js";

// Create a new category
export const createCategory = async (req, res, next) => {
    try {
        const name = String(req.body?.name || '').trim();
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existing = await Category.findOne({
            name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' }
        }).exec();
        if (existing) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        const newCategory = new Category({
            ...req.body,
            name
        });
        const savedCategory = await newCategory.save();
        res.status(200).json(savedCategory);
    } catch (err) {
        next(err);
    }   
};

// Get all categories
export const getCategories = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 10; // Adjust as needed
        const skip = (page - 1) * pageSize;

        const totalCategories = await Category.countDocuments();
        const categories = await Category.find()
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({ categories, totalCategories });
    } catch (err) {
        next(err);
    }
}

export const getAllCategories = async (req, res, next) => {
    try {
        const page = req.query.page;
        if (page) {
            const pageSize = 10;
            const skip = (page - 1) * pageSize;
            const totalCategories = await Category.countDocuments();
            const categories = await Category.find({}, '_id name image products')
                .skip(skip)
                .limit(pageSize);
            return res.status(200).json({ categories, totalCategories });
        }

        // Fetch all categories including product references to calculate counts
        const categories = await Category.find({}, '_id name image products').exec();

        res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}

// Delete a category
export const deleteCategory = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const deletedCategory=await Category.findByIdAndDelete(req.params.categoryId);
        const products=await Product.deleteMany({ categoryId: req.params.categoryId });
        if(deletedCategory && products){
            res.status(200).json(deletedCategory);
            // res.status(201).json(products)
        }
    } catch (err) {
        next(err);
    }
}

export const getCategoryById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const name = String(req.body?.name || '').trim();
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existing = await Category.findOne({
            _id: { $ne: categoryId },
            name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' }
        }).exec();
        if (existing) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        const updated = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true }
        );
        if (!updated) {
            console.log('Category not found for categoryId:', categoryId);
            return res.status(404).json({ message: 'Category not found' });
        }

        await Product.updateMany(
            { categoryId },
            { $set: { categoryName: name } }
        );

        res.status(200).json(updated);
    } catch (err) {
        console.error('updateCategory error:', err);
        next(err);
    }
};

export const removeCategoryImage = async (req, res, next) => {
    console.log('removeCategoryImage called with categoryId:', req.params.categoryId, 'imageFilename:', req.body.imageFilename);
    try {
        const { categoryId } = req.params;
        const { imageFilename } = req.body;
        if (!imageFilename) {
            return res.status(400).json({ message: 'Image filename is required' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Remove the image filename from the array
        category.image = category.image.filter((img) => img !== imageFilename);
        await category.save();

        // Also delete from Cloudinary if it's a Cloudinary URL
        if (imageFilename.includes('cloudinary.com')) {
            try {
                const parts = imageFilename.split('/');
                const file = parts.pop();
                const folder = parts.pop();
                const publicId = `${folder}/${file.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error('Cloudinary delete error:', err);
            }
        }

        res.status(200).json(category);
    } catch (err) {
        console.error('removeCategoryImage error:', err);
        next(err);
    }
};

// Get products within a category
export const getCategoryProducts = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const category = await Category.findById(req.params.categoryId).populate('products');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category.products);
    } catch (err) {
        next(err);
    }
}

export const updateimg=async(req,res)=>{
    const {categoryId}=req.params;
    const image=req.files;
    const imgs=image.map((item)=>item.path)
    try {
        const updatedImg=await Category.findByIdAndUpdate(categoryId,{image:imgs},{new:true});
        res.json(updatedImg)
    } catch (error) {
        res.json(error.message)
    }
}

export const getzeroindeximg = async (req, res) => {
    try {
      const categories = await Category.find({}, { _id: 1, image: { $slice: 1 } }); // Only retrieve the first image and category ID
    //   const execStats = await Category.find({}, { _id: 1, image: { $slice: 1 } }).explain('executionStats'); 
    //   console.log(execStats)
      const zerothIndexImages = categories.map(category => ({
        categoryId: category._id,
        image: category.image[0]
      }));
  
      res.json(zerothIndexImages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch zeroth index images from categories' });
    }
  };
  

//not required as it is done in products differently
// // Create a new product within a category
// export const createProductInCategory = async (req, res, next) => {
//     const { name, description, price } = req.body;
//     try {
//         const category = await Category.findById(req.params.id);
//         if (!category) {
//             return next(errorHandler,(400,'Category not found'))
//         }
//         const newProduct = new Product({ name, description, price, category: category._id });
//         const savedProduct = await newProduct.save();
//         category.products.push(savedProduct._id);
//         await category.save();
//         res.status(201).json(savedProduct);
//     } catch (err) {
//         next(err);
//     }
// }

// // Update a product within a category
// export const updateProductInCategory = async (req, res, next) => {
//     try {
//         const product = await Product.findById(req.params.productId);
//         if (!product) {
//             return next(errorHandler,(400,'Product not found'))
//         }
//         product.set(req.body);
//         const updatedProduct = await product.save();
//         res.status(200).json(updatedProduct);
//     } catch (err) {
//         next(err);
//     }
// }

// // Delete a product within a category
// export const deleteProductInCategory = async (req, res, next) => {
//     try {
//         const product = await Product.findById(req.params.productId);
//         if (!product) {
//             return next(errorHandler,(400,'Product not found'))
//         }
//         const category = await Category.findById(product.category);
//         if (category) {
//             category.products = category.products.filter(productId => productId.toString() !== req.params.productId);
//             await category.save();
//         }
//         await product.remove();
//         res.status(200).json({ message: 'Product deleted' });
//     } catch (err) {
//         next(err);
//     }
// }
