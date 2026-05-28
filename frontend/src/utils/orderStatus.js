export const ORDER_DELIVERY_HOURS = 24;

/** Hours after return approval before pickup is scheduled (matches backend lifecycle) */
export const RETURN_PICKUP_AFTER_APPROVAL_HOURS = 4;

export const STATUS_LABELS = {
  payment_pending: 'Payment Pending',
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
  return_requested: 'Return Requested',
  return_approved: 'Return Approved',
  return_pickup_scheduled: 'Pickup Scheduled',
  return_picked_up: 'Picked Up',
  refunded: 'Refunded',
};

export const STATUS_COLORS = {
  confirmed: 'text-green-600',
  processing: 'text-blue-600',
  shipped: 'text-indigo-600',
  out_for_delivery: 'text-violet-600',
  delivered: 'text-green-700',
  cancelled: 'text-red-600',
  failed: 'text-red-600',
  return_requested: 'text-amber-600',
  return_approved: 'text-amber-700',
  return_pickup_scheduled: 'text-orange-600',
  return_picked_up: 'text-orange-700',
  refunded: 'text-emerald-700',
};

/** Delivery estimate from now (24h window) */
export function getDeliveryEstimateFrom(from = new Date()) {
  return new Date(from.getTime() + ORDER_DELIVERY_HOURS * 60 * 60 * 1000);
}

const deliveryDateOnlyFormat = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/** Customer orders: delivery date only (no time) */
export function formatCustomerDeliveryDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : getDeliveryEstimateFrom();
  return d.toLocaleDateString('en-IN', deliveryDateOnlyFormat);
}

const deliveryDateTimeFormat = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

/** Admin / checkout: date and time */
export function formatExpectedDelivery(dateStr) {
  const d = dateStr ? new Date(dateStr) : getDeliveryEstimateFrom();
  return `By ${d.toLocaleString('en-IN', deliveryDateTimeFormat)}`;
}

/** Cancel full order only before delivery completes */
export function canCancelOrder(status) {
  return ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'pending'].includes(status);
}

/** Customer may withdraw return before pickup */
export const CANCELLABLE_RETURN_STATUSES = [
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
];

export function canCancelReturn(status) {
  return CANCELLABLE_RETURN_STATUSES.includes(status);
}

const DELIVERED_LIKE = new Set([
  'delivered',
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
  'return_picked_up',
  'refunded',
]);

const HIDE_DELIVERED_DATE_STATUSES = new Set(['refunded', 'cancelled', 'failed']);

/** Show "Delivery by …" only while order is still in transit */
export function shouldShowDeliveryEstimate(status) {
  return !DELIVERED_LIKE.has(status) && status !== 'cancelled' && status !== 'failed';
}

/** Show "Delivered on …" only for delivered/return flow, excluding terminal failure/refund states. */
export function shouldShowDeliveredDate(status) {
  return DELIVERED_LIKE.has(status) && !HIDE_DELIVERED_DATE_STATUSES.has(status);
}

export function formatDeliveredOn(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', deliveryDateOnlyFormat);
}

/**
 * Pickup date for return_pickup_scheduled orders.
 * Uses returnPickupScheduledAt when set; otherwise estimates from returnApprovedAt.
 */
export function getReturnPickupDateInfo(order) {
  if (order?.status !== 'return_pickup_scheduled') return null;

  if (order.returnPickupScheduledAt) {
    return {
      label: 'Pickup scheduled for',
      formatted: formatCustomerDeliveryDate(order.returnPickupScheduledAt),
      isEstimate: false,
    };
  }

  if (order.returnApprovedAt) {
    const estimated = new Date(order.returnApprovedAt);
    estimated.setTime(
      estimated.getTime() + RETURN_PICKUP_AFTER_APPROVAL_HOURS * 60 * 60 * 1000
    );
    return {
      label: 'Estimated pickup by',
      formatted: formatCustomerDeliveryDate(estimated.toISOString()),
      isEstimate: true,
    };
  }

  return null;
}
