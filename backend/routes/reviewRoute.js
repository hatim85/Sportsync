import express from 'express';
import { getProductReviews, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/order/:orderId', submitReview);

export default router;
