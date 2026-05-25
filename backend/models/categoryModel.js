import mongoose from "mongoose";
import Product from "./productModel.js";

const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    slug: {
        type: String,
        unique: true
    },
    image:{
        type:[String]
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
})

const Category = mongoose.model('Category', categorySchema)
export default Category;