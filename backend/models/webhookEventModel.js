import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    event: { type: String, required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ['processing', 'processed', 'skipped', 'failed'],
      default: 'processing',
    },
    error: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);
export default WebhookEvent;
