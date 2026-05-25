import mongoose from "mongoose";
import User from "./userModel.js";
import CartItem from "./cartItemModel.js";

const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    cartItems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'CartItem'
    }]
})

const Cart = mongoose.model('Cart', cartSchema)
export default Cart;