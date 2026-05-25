import PaymentAlert from '../models/paymentAlertModel.js';
import { sendAdminAlertEmail } from './emailService.js';

export async function createPaymentAlert({
  type,
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  message,
  meta,
}) {
  const alert = await PaymentAlert.create({
    type,
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    message,
    meta,
  });

  try {
    await sendAdminAlertEmail({ type, orderId, message });
  } catch (err) {
    console.error('Admin alert email failed:', err.message);
  }

  return alert;
}
