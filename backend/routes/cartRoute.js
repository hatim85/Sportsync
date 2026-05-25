import express from 'express'
import { updateCartItem, deleteCartItem,getCartProducts,addToCart,removeFromCart, updateCartItemQuantity } from '../controllers/cartController.js';
import Product from '../models/productModel.js';
import CartItem from '../models/cartItemModel.js';

const router=express.Router();

router.get('/getcart/:userId',getCartProducts)
router.put('/update/:cartItemId',updateCartItemQuantity);
router.delete('/delete/:cartItemId',removeFromCart);
router.post('/addToCart/:productId',addToCart)
router.delete('/remove/:cartItemId',removeFromCart)
router.put('/update/:id',updateCartItem);
router.delete('/delete/:id',deleteCartItem);

export default router;