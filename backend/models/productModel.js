import mongoose from "mongoose";
import Category from "./categoryModel.js";
import User from "./userModel.js";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },

    slug: {
        type: String,
        unique: true
    },

    brand: {
        type: String
    },

    price: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: 'Price cannot be negative'
        }
    },

    discountPrice: {
        type: Number
    },

    description: {
        type: String,
        required: true,
        maxLength: 1000
    },

    image: {
        type: [String],
        default: []
    },

    coverImageIndex: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        default: 0
    },

    sizes: [{
        type: String
    }],

    colors: [{
        type: String
    }],

    rating: {
        type: Number,
        default: 0
    },

    reviewsCount: {
        type: Number,
        default: 0
    },

    featured: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    categoryName: {
        type: String
    }

}, { timestamps: true })

function arrayLimit(val) {
    return val.length <= 4;
}

const Product = mongoose.model('Product', productSchema)
export default Product;