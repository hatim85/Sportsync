import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.post('/add', addToWishlist);
router.post('/remove', removeFromWishlist);
router.get('/:userId', getWishlist);

export default router;
