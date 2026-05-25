import User from "../models/userModel.js";
import Product from '../models/productModel.js';
import { errorHandler } from "../utils/error.js";
import { getMakingCharge, applyMakingChargeToProductDoc } from "../utils/pricing.js";

export const addToWishlist = async (req, res, next) => {
    const { productId, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        if (user.wishlist.includes(productId)) {
            return res.status(200).json({ message: "Product already in wishlist", wishlist: user.wishlist });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req, res, next) => {
    const { productId, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        next(error);
    }
};

export const getWishlist = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('wishlist');
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const makingCharge = await getMakingCharge();
        const wishlistProducts = user.wishlist.map(p => applyMakingChargeToProductDoc(p, makingCharge));

        res.status(200).json(wishlistProducts);
    } catch (error) {
        next(error);
    }
};
