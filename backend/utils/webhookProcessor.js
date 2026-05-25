import crypto from 'crypto';
import Payment from '../models/paymentModel.js';
import Order from '../models/orderModel.js';
import WebhookEvent from '../models/webhookEventModel.js';
import { createPaymentAlert } from './paymentAlerts.js';

const RETURN_STATUSES = [
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
  'return_picked_up',
  'refunded',
];

export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function buildEventId(payload, headers) {
  return (
    headers['x-razorpay-event-id'] ||
    `${payload.event}_${payload.created_at || Date.now()}_${JSON.stringify(payload.payload?.payment?.entity?.id || payload.payload?.order?.entity?.id || payload.payload?.refund?.entity?.id || '')}`
  );
}

async function claimWebhookEvent(eventId, event, meta = {}) {
  try {
    await WebhookEvent.create({
      eventId,
      event,
      status: 'processing',
      meta,
    });
    return { duplicate: false };
  } catch (err) {
    if (err.code !== 11000) throw err;
    const existing = await WebhookEvent.findOne({ eventId }).lean();
    return { duplicate: true, existing };
  }
}

async function finishWebhookEvent(eventId, { status, orderId, paymentId, error }) {
  await WebhookEvent.findOneAndUpdate(
    { eventId },
    {
      status,
      orderId,
      paymentId,
      error,
    }
  );
}

async function confirmOrderPayment(razorpay_order_id, razorpay_payment_id) {
  const order = await Order.findOne({ razorpay_order_id });
  if (order && order.status === 'payment_pending') {
    order.status = 'confirmed';
    await order.save();
    console.log('Order confirmed via webhook:', order._id);
  }

  if (razorpay_payment_id) {
    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature: 'webhook',
      }
    );
  }

  return order;
}

async function handlePaymentCaptured(payload) {
  const paymentEntity = payload.payload.payment.entity;
  return confirmOrderPayment(paymentEntity.order_id, paymentEntity.id);
}

async function handleOrderPaid(payload) {
  const orderEntity = payload.payload.order.entity;
  const paymentId =
    orderEntity.payments?.[0] || orderEntity.payment_id || null;
  return confirmOrderPayment(orderEntity.id, paymentId);
}

async function handlePaymentFailed(payload) {
  const paymentEntity = payload.payload.payment.entity;
  const order = await Order.findOne({ razorpay_order_id: paymentEntity.order_id });
  if (order && (order.status === 'pending' || order.status === 'payment_pending')) {
    order.status = 'failed';
    await order.save();
    await createPaymentAlert({
      type: 'payment_failed',
      orderId: order._id,
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
      message: `Payment failed for order ${order._id}`,
      meta: { error: paymentEntity.error_description },
    });
  }
  return order;
}

async function handleRefundEvent(event, payload) {
  const refundObj = payload.payload?.refund?.entity;
  if (!refundObj?.payment_id) return null;

  const payment = await Payment.findOne({ razorpay_payment_id: refundObj.payment_id });
  if (!payment) return null;

  const order = await Order.findOne({ paymentId: payment._id });
  if (!order) return null;

  if (event === 'refund.created') {
    if (!order.refundNote) {
      order.refundNote =
        order.status === 'cancelled'
          ? 'Cancellation refund initiated to your original payment method (5–7 business days).'
          : 'Refund initiated to your original payment method (5–7 business days).';
    }
    order.refundStatus = 'initiated';
    order.razorpayRefundId = order.razorpayRefundId || refundObj.id;
    await order.save();
  } else if (event === 'refund.processed') {
    if (order.status === 'refunded') {
      order.refundNote =
        order.refundNote ||
        'Refund completed to your original payment method (5–7 business days).';
      if (!order.refundProcessedAt) order.refundProcessedAt = new Date();
    } else if (RETURN_STATUSES.includes(order.status)) {
      order.status = 'refunded';
      order.refundProcessedAt = order.refundProcessedAt || new Date();
      order.refundNote =
        order.refundNote ||
        'Refund completed to your original payment method (5–7 business days).';
    } else if (order.status === 'cancelled') {
      order.refundNote =
        order.refundNote ||
        'Cancellation refund completed to your original payment method.';
    } else {
      order.status = 'cancelled';
      order.refundNote =
        order.refundNote ||
        'Order cancelled; refund completed to your original payment method.';
    }
    order.refundStatus = 'processed';
    order.razorpayRefundId = refundObj.id;
    await order.save();
  } else if (event === 'refund.failed') {
    order.refundStatus = 'failed';
    order.refundNote =
      'Refund could not be completed automatically. Our team will process it within 5–7 business days.';
    await order.save();
    await createPaymentAlert({
      type: 'refund_failed',
      orderId: order._id,
      razorpayPaymentId: refundObj.payment_id,
      message: refundObj.error_description || 'Razorpay refund.failed',
      meta: { refundId: refundObj.id },
    });
  }

  return order;
}

export async function processRazorpayWebhook(payload, headers = {}) {
  const eventId = buildEventId(payload, headers);
  const claim = await claimWebhookEvent(eventId, payload.event, {
    account: payload.account_id,
  });

  if (claim.duplicate) {
    const st = claim.existing?.status;
    if (st === 'processed' || st === 'skipped' || st === 'processing') {
      return { skipped: true, eventId, reason: 'duplicate' };
    }
    if (st === 'failed') {
      await WebhookEvent.updateOne({ eventId }, { status: 'processing', error: null });
    }
  }

  let order = null;
  let paymentId = null;

  try {
    if (payload.event === 'payment.captured') {
      order = await handlePaymentCaptured(payload);
      paymentId = payload.payload?.payment?.entity?.id;
    } else if (payload.event === 'order.paid') {
      order = await handleOrderPaid(payload);
      paymentId = payload.payload?.order?.entity?.payments?.[0];
    } else if (payload.event === 'payment.failed') {
      order = await handlePaymentFailed(payload);
      paymentId = payload.payload?.payment?.entity?.id;
    } else if (payload.event.startsWith('refund.')) {
      order = await handleRefundEvent(payload.event, payload);
      paymentId = payload.payload?.refund?.entity?.payment_id;
    } else {
      await finishWebhookEvent(eventId, { status: 'skipped' });
      return { skipped: true, eventId, reason: 'unhandled_event' };
    }

    await finishWebhookEvent(eventId, {
      status: 'processed',
      orderId: order?._id,
      paymentId,
    });
    return { processed: true, eventId, orderId: order?._id };
  } catch (err) {
    await finishWebhookEvent(eventId, {
      status: 'failed',
      error: err.message,
    });
    await createPaymentAlert({
      type: 'webhook_error',
      message: `Webhook ${payload.event} failed: ${err.message}`,
      meta: { eventId },
    });
    throw err;
  }
}
