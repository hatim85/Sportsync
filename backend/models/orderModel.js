import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unitPriceAtPurchase: {
            type: Number,
            required: true
        },
        size: { type: String },
        color: { type: String },
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    },
    razorpay_order_id: {
        type: String
    },
    address: {
        fullName: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        country: String,
        postalCode: String,
        phoneNumber: String
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'cod'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: [
            'payment_pending',
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'failed',
            'return_requested',
            'return_approved',
            'return_pickup_scheduled',
            'return_picked_up',
            'refunded'
        ],
        default: 'confirmed'
    },
    returnRequestedAt: { type: Date },
    returnApprovedAt: { type: Date },
    returnPickupScheduledAt: { type: Date },
    returnPickedUpAt: { type: Date },
    returnReason: { type: String, maxlength: 500 },
    refundProcessedAt: { type: Date },
    refundNote: { type: String },
    razorpayRefundId: { type: String },
    refundStatus: {
        type: String,
        enum: ['none', 'initiated', 'processed', 'failed'],
        default: 'none',
    },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
