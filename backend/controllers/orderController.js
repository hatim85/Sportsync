import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import {
    getExpectedDeliveryDate,
    applyOrderLifecycle,
    isWithinReturnWindow,
    getStatusTimeline,
} from '../utils/orderLifecycle.js';
import { processOrderRefund } from '../utils/refundService.js';
import { userOwnsOrder, userMatchesParam } from '../utils/orderAccess.js';

const populateOrder = [
    { path: 'products.productId' },
    { path: 'paymentId' },
];

async function processRefundIfPickedUp(order) {
    if (order.status !== 'return_picked_up' || order.refundProcessedAt) {
        return order;
    }
    order.refundNote = await processOrderRefund(order);
    order.refundProcessedAt = new Date();
    order.status = 'refunded';
    order.statusUpdatedAt = new Date();
    await order.save();
    return order;
}

export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { products, paymentMethod, status, totalAmount, address } = req.body;
        const productIds = products.map(p => p.productId);
        const dbProducts = await Product.find({ _id: { $in: productIds } }).select("_id price").lean();
        const priceMap = new Map(dbProducts.map(p => [String(p._id), Number(p.price || 0)]));

        const orderLines = products.map(p => {
            const unitPriceAtPurchase = priceMap.get(String(p.productId)) ?? 0;
            return {
                productId: p.productId,
                quantity: p.quantity,
                unitPriceAtPurchase,
                size: p.size,
                color: p.color,
            };
        });

        const orderDate = new Date();
        const expectedDeliveryDate = getExpectedDeliveryDate(orderDate);

        const newOrder = new Order({
            userId,
            products: orderLines,
            totalAmount,
            paymentId: null,
            paymentMethod: paymentMethod || 'cod',
            status: status === 'payment_pending' ? 'payment_pending' : 'confirmed',
            orderDate,
            expectedDeliveryDate,
            address,
            statusUpdatedAt: orderDate,
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('createOrder error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        let order = await Order.findById(req.params.orderId)
            .populate(populateOrder);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!userOwnsOrder(req, order)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        order = await applyOrderLifecycle(order);
        order = await processRefundIfPickedUp(order);
        await order.populate(populateOrder);

        const timeline = getStatusTimeline(order);
        res.status(200).json({ ...order.toObject(), timeline });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userMatchesParam(req, userId)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        let orders = await Order.find({ userId, status: { $ne: 'payment_pending' } })
            .sort({ orderDate: -1 })
            .populate(populateOrder);

        const processed = [];
        for (const order of orders) {
            let o = await applyOrderLifecycle(order);
            o = await processRefundIfPickedUp(o);
            const reviewedProductIds = await Review.find({ orderId: o._id }).distinct('productId');
            processed.push({
                ...o.toObject(),
                reviewedProductIds: reviewedProductIds.map(String),
                canReturn: o.status === 'delivered' && isWithinReturnWindow(o),
                canCancelReturn: CANCELLABLE_RETURN.includes(o.status),
                timeline: getStatusTimeline(o),
            });
        }

        res.status(200).json(processed);
    } catch (error) {
        res.status(500).json({
            message: 'Error in fetching orders',
            error: error.message,
        });
    }
};

const CANCELLABLE_RETURN = ['return_requested', 'return_approved', 'return_pickup_scheduled'];

export const cancelReturn = async (req, res) => {
    try {
        const { orderId } = req.params;

        let order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!userOwnsOrder(req, order)) {
            return res.status(403).json({ message: 'Not your order' });
        }

        if (!CANCELLABLE_RETURN.includes(order.status)) {
            return res.status(400).json({
                message: 'Return can only be cancelled before pickup is completed',
            });
        }

        await Order.findByIdAndUpdate(orderId, {
            $set: {
                status: 'delivered',
                statusUpdatedAt: new Date(),
            },
            $unset: {
                returnRequestedAt: '',
                returnApprovedAt: '',
                returnPickupScheduledAt: '',
                returnReason: '',
            },
        });
        order = await Order.findById(orderId);

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const requestReturn = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        let order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!userOwnsOrder(req, order)) {
            return res.status(403).json({ message: 'Not your order' });
        }

        order = await applyOrderLifecycle(order);

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Returns are only available after delivery' });
        }
        if (!isWithinReturnWindow(order)) {
            return res.status(400).json({ message: 'Return window expired (15 days from delivery)' });
        }

        order.status = 'return_requested';
        order.returnRequestedAt = new Date();
        order.returnReason = (reason || '').trim() || 'Customer requested return';
        order.statusUpdatedAt = new Date();
        await order.save();

        order = await applyOrderLifecycle(order);
        order = await processRefundIfPickedUp(order);

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const CANCELLABLE = ['confirmed', 'processing', 'shipped', 'pending'];

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('paymentId');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!userOwnsOrder(req, order)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (order.status === 'cancelled') {
            return res.status(200).json(order);
        }
        if (!CANCELLABLE.includes(order.status)) {
            return res.status(400).json({
                message: 'Order can no longer be cancelled at this stage.',
            });
        }

        await processOrderRefund(order, 'cancel');
        order.status = 'cancelled';
        order.statusUpdatedAt = new Date();
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        let orderToUpdate = await Order.findById(orderId).populate('paymentId');
        if (!orderToUpdate) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const now = new Date();

        if (status === 'cancelled' && orderToUpdate.status !== 'cancelled') {
            await processOrderRefund(orderToUpdate, 'cancel');
        }

        orderToUpdate.status = status;
        orderToUpdate.statusUpdatedAt = now;

        if (status === 'delivered' && !orderToUpdate.deliveredAt) {
            orderToUpdate.deliveredAt = now;
        }
        if (status === 'return_requested' && !orderToUpdate.returnRequestedAt) {
            orderToUpdate.returnRequestedAt = now;
        }
        if (status === 'return_approved' && !orderToUpdate.returnApprovedAt) {
            orderToUpdate.returnApprovedAt = now;
        }
        if (status === 'return_pickup_scheduled' && !orderToUpdate.returnPickupScheduledAt) {
            orderToUpdate.returnPickupScheduledAt = now;
        }
        if (status === 'return_picked_up' && !orderToUpdate.returnPickedUpAt) {
            orderToUpdate.returnPickedUpAt = now;
        }

        await orderToUpdate.save();

        if (status === 'return_picked_up') {
            orderToUpdate = await processRefundIfPickedUp(orderToUpdate);
        }

        res.status(200).json(orderToUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAdminOrders = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const totalOrders = await Order.countDocuments({ status: { $ne: 'payment_pending' } });
        let orders = await Order.find({ status: { $ne: 'payment_pending' } })
            .sort({ orderDate: -1 })
            .populate({ path: 'userId', select: 'firstName lastName username email' })
            .populate(populateOrder)
            .skip(skip)
            .limit(pageSize);

        const processed = [];
        for (const order of orders) {
            let o = await applyOrderLifecycle(order);
            o = await processRefundIfPickedUp(o);
            processed.push(o);
        }

        res.status(200).json({ orders: processed, totalOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
