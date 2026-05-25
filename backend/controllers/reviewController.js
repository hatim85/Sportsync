import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { applyOrderLifecycle } from '../utils/orderLifecycle.js';

export async function recalculateProductRating(productId) {
  const reviews = await Review.find({ productId });
  const count = reviews.length;
  const avg = count
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    reviewsCount: count,
  });
  return { rating: Math.round(avg * 10) / 10, reviewsCount: count };
}

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const stats = await recalculateProductRating(productId);

    res.status(200).json({ reviews, ...stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, rating, comment, userId } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({ message: 'userId, productId and rating are required' });
    }

    const r = Number(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not your order' });
    }

    order = await applyOrderLifecycle(order);

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'You can review after the order is delivered' });
    }

    const line = order.products.find((p) => String(p.productId) === String(productId));
    if (!line) {
      return res.status(400).json({ message: 'Product not in this order' });
    }

    const existing = await Review.findOne({ userId, orderId, productId });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product for this order' });
    }

    const user = await User.findById(userId).select('username firstName lastName');
    const displayName =
      user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user?.username || 'Customer';

    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating: r,
      comment: (comment || '').trim(),
      userName: displayName,
    });

    const stats = await recalculateProductRating(productId);

    res.status(201).json({ review, ...stats });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Review already submitted' });
    }
    res.status(500).json({ message: error.message });
  }
};
