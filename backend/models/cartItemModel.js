import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    size: {
        type: String
    },
    color: {
        type: String
    }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);
export default CartItem;
