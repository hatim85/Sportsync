import Payment from '../models/paymentModel.js';
import Order from '../models/orderModel.js';
import { instance } from '../index.js';
import crypto from 'crypto';
import Product from "../models/productModel.js";
import { getMakingCharge, getDeliveryCharge } from "../utils/pricing.js";
import { getExpectedDeliveryDate } from "../utils/orderLifecycle.js";
import { userOwnsOrder } from '../utils/orderAccess.js';
import { verifyWebhookSignature, processRazorpayWebhook } from '../utils/webhookProcessor.js';

function computeOrderTotal(orderLines, deliveryChargeSetting) {
  const subtotal = orderLines.reduce(
    (sum, line) => sum + line.unitPriceAtPurchase * line.quantity,
    0
  );
  const deliveryFee =
    subtotal > 0 && subtotal < 499 ? Number(deliveryChargeSetting) || 0 : 0;
  return Math.round(subtotal + deliveryFee);
}

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, totalAmount, address } = req.body;

    const makingCharge = await getMakingCharge();
    const deliveryChargeSetting = await getDeliveryCharge();
    const decodedProducts = typeof products === 'string' ? JSON.parse(decodeURIComponent(products)) : products;
    if (!Array.isArray(decodedProducts) || decodedProducts.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const productIds = decodedProducts.map(p => p.productId);

    const dbProducts = await Product.find({ _id: { $in: productIds } }).select("_id price").lean();
    const priceMap = new Map(dbProducts.map(p => [String(p._id), Number(p.price || 0)]));

    const orderLines = decodedProducts.map(p => {
      const basePrice = priceMap.get(String(p.productId)) ?? 0;
      const unitPriceAtPurchase = basePrice + makingCharge;
      return {
        productId: p.productId,
        quantity: p.quantity,
        unitPriceAtPurchase,
        size: p.size,
        metalType: p.metalType,
        engraving: p.engraving,
        stone: p.stone,
        finish: p.finish
      };
    });

    const serverTotal = computeOrderTotal(orderLines, deliveryChargeSetting);
    const clientTotal = Math.round(Number(totalAmount));
    if (!clientTotal || Math.abs(serverTotal - clientTotal) > 1) {
      return res.status(400).json({
        error: 'Order total mismatch. Please refresh checkout and try again.',
      });
    }

    const options = {
      amount: serverTotal * 100,
      currency: "INR",
      receipt: "order_rcpt_" + Date.now().toString().slice(-6)
    };

    const order = await instance.orders.create(options);

    const payment = new Payment({
      amount: serverTotal,
      paymentDate: new Date(),
      paymentMethod: 'razorpay',
      razorpay_order_id: order.id
    });
    const savedPayment = await payment.save();

    const orderDate = new Date();
    const expectedDeliveryDate = getExpectedDeliveryDate(orderDate);

    const newOrder = new Order({
      userId,
      products: orderLines,
      totalAmount: serverTotal,
      paymentId: savedPayment._id,
      razorpay_order_id: order.id,
      paymentMethod: 'online',
      status: 'payment_pending',
      orderDate,
      expectedDeliveryDate,
      address,
      refundStatus: 'none',
    });
    await newOrder.save();

    res.status(200).json({
      order,
      dbOrderId: newOrder._id
    });
  } catch (error) {
    console.error('createPayment error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, dbOrderId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !dbOrderId) {
      return res.status(400).json({ success: false, message: 'Missing payment fields' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (!userOwnsOrder(req, order)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (order.razorpay_order_id && order.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment does not match this order" });
    }

    if (order.status === 'payment_pending') {
      order.status = 'confirmed';
      await order.save();
    }

    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { razorpay_payment_id, razorpay_signature }
    );

    console.log("Order confirmed via direct verification:", dbOrderId);
    return res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      console.error('WEBHOOK_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Webhook not configured' });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const razorpaySignature = req.headers['x-razorpay-signature'];

    if (!verifyWebhookSignature(rawBody, razorpaySignature, secret)) {
      console.error("Webhook signature mismatch.");
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const result = await processRazorpayWebhook(req.body, req.headers);
    console.log('Webhook handled:', result);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
