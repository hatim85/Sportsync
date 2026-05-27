import Payment from '../models/paymentModel.js';
import { instance } from '../index.js';

async function resolvePaymentForRefund(order) {
  let payment = null;
  if (order.paymentId) {
    payment = await Payment.findById(order.paymentId);
  }
  if (!payment && order.razorpay_order_id) {
    payment = await Payment.findOne({ razorpay_order_id: order.razorpay_order_id });
  }
  if (!payment && order.razorpay_order_id) {
    payment = await Payment.create({
      amount: order.totalAmount,
      paymentDate: new Date(),
      paymentMethod: 'razorpay',
      razorpay_order_id: order.razorpay_order_id,
    });
    order.paymentId = payment._id;
  }
  return payment;
}

async function ensureRazorpayPaymentId(order, payment) {
  if (payment?.razorpay_payment_id) return payment.razorpay_payment_id;
  if (!order.razorpay_order_id) return null;

  try {
    const paymentList = await instance.orders.fetchPayments(order.razorpay_order_id);
    const items = paymentList?.items || [];
    if (!items.length) return null;
    const best = items.find((p) => p.status === 'captured') || items[0];
    if (payment) {
      payment.razorpay_payment_id = best.id;
      await payment.save();
    }
    return best.id;
  } catch (err) {
    console.error('Unable to fetch Razorpay order payments:', err.message);
    return null;
  }
}

/**
 * Initiate Razorpay refund for online orders.
 * @param {'return'|'cancel'} type
 * @returns {{ note: string, razorpayRefundId?: string, refundStatus?: string }}
 */
export async function initiateRazorpayRefund(order, type = 'return') {
  if (order.razorpayRefundId && order.refundStatus !== 'failed') {
    return {
      note: order.refundNote || 'Refund already initiated for this order.',
      razorpayRefundId: order.razorpayRefundId,
      refundStatus: order.refundStatus || 'initiated',
    };
  }

  const payment = await resolvePaymentForRefund(order);
  const razorpayPaymentId = await ensureRazorpayPaymentId(order, payment);
  if (!razorpayPaymentId) {
    return {
      note:
        type === 'cancel'
          ? 'Order cancelled. Refund pending: payment capture not confirmed yet.'
          : 'Refund pending: payment capture not confirmed yet.',
      refundStatus: 'failed',
    };
  }

  try {
    const refund = await instance.payments.refund(razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100),
      speed: 'normal',
    });
    console.log(`Razorpay ${type} refund initiated:`, order._id, refund?.id);
    return {
      note:
        type === 'cancel'
          ? 'Order cancelled. Refund initiated to your original payment method (5–7 business days).'
          : 'Refund initiated to your original payment method (5–7 business days).',
      razorpayRefundId: refund?.id,
      refundStatus: 'initiated',
    };
  } catch (err) {
    console.error(`Razorpay ${type} refund error:`, err.message);
    return {
      note:
        type === 'cancel'
          ? 'Order cancelled. Refund queued; our team will complete it within 5–7 business days.'
          : 'Refund queued; our team will complete it within 5–7 business days.',
      refundStatus: 'failed',
    };
  }
}

function applyRefundResult(order, result) {
  order.refundNote = result.note;
  if (result.razorpayRefundId) order.razorpayRefundId = result.razorpayRefundId;
  if (result.refundStatus) order.refundStatus = result.refundStatus;
}

/**
 * Process refund after return pickup or order cancellation (online/COD).
 */
export async function processOrderRefund(order, type = 'return') {
  const method = (order.paymentMethod || 'cod').toLowerCase();

  if (method === 'online' && order.paymentId) {
    const result = await initiateRazorpayRefund(order, type);
    applyRefundResult(order, result);
    return result.note;
  }

  if (type === 'cancel') {
    order.refundNote = 'Order cancelled. COD orders do not require an online refund.';
    order.refundStatus = 'none';
    return order.refundNote;
  }

  const note =
    'COD order: refund of ₹' +
    order.totalAmount +
    ' will be transferred to your bank/UPI within 5–7 business days after verification.';
  order.refundNote = note;
  order.refundStatus = 'none';
  return note;
}
