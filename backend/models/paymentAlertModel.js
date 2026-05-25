import mongoose from 'mongoose';

const paymentAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['refund_failed', 'webhook_error', 'payment_failed'],
      required: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const PaymentAlert = mongoose.model('PaymentAlert', paymentAlertSchema);
export default PaymentAlert;
