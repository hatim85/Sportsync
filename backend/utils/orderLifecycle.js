/** Order delivery, auto status progression, and return/refund helpers */

const MS_HOUR = 60 * 60 * 1000;

/** Delivered exactly this many hours after order placement */
export const ORDER_DELIVERY_HOURS = 24;

/** Hours from order time when each fulfillment status begins */
const H_PROCESSING = 2;
const H_SHIPPED = 8;
const H_OUT_FOR_DELIVERY = 18;

export const ACTIVE_STATUSES = [
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

/** Fulfillment rank — auto-lifecycle only moves forward, never downgrades */
const FULFILLMENT_RANK = {
  confirmed: 0,
  processing: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
};
export const RETURN_STATUSES = [
  'return_requested',
  'return_approved',
  'return_pickup_scheduled',
  'return_picked_up',
  'refunded',
];
export const SKIP_AUTO = new Set([
  'payment_pending',
  'pending',
  'cancelled',
  'failed',
  ...RETURN_STATUSES,
]);

/** Expected delivery = order time + 24 hours (displayed as "by" that time) */
export function getExpectedDeliveryDate(fromDate = new Date()) {
  const placed = new Date(fromDate);
  return new Date(placed.getTime() + ORDER_DELIVERY_HOURS * MS_HOUR);
}

export function getDeliveryAt(order) {
  const placed = new Date(order.orderDate || order.createdAt || Date.now()).getTime();
  return placed + ORDER_DELIVERY_HOURS * MS_HOUR;
}

/**
 * Forward fulfillment status from order timeline (24h total).
 * confirmed (0–2h) → processing (2–8h) → shipped (8–18h) → out_for_delivery (18–24h) → delivered (24h+)
 */
export function computeFulfillmentStatus(order, now = new Date()) {
  if (SKIP_AUTO.has(order.status)) return order.status;

  const placed = new Date(order.orderDate || order.createdAt || now).getTime();
  const deliveryAt = getDeliveryAt(order);
  const t = now.getTime();
  const elapsed = t - placed;

  let computed = 'confirmed';
  if (t >= deliveryAt) computed = 'delivered';
  else if (elapsed >= H_OUT_FOR_DELIVERY * MS_HOUR) computed = 'out_for_delivery';
  else if (elapsed >= H_SHIPPED * MS_HOUR) computed = 'shipped';
  else if (elapsed >= H_PROCESSING * MS_HOUR) computed = 'processing';

  const currentRank = FULFILLMENT_RANK[order.status] ?? -1;
  const computedRank = FULFILLMENT_RANK[computed] ?? -1;

  // Keep admin/DB manual updates (e.g. delivered before 24h) — never downgrade
  if (currentRank > computedRank) return order.status;
  return computed;
}

/**
 * Auto-advance return workflow after customer request.
 */
export function computeReturnStatus(order, now = new Date()) {
  const s = order.status;
  const t = now.getTime();

  if (s === 'return_requested' && order.returnRequestedAt) {
    const approvedAt = new Date(order.returnRequestedAt).getTime() + 2 * MS_HOUR;
    if (t >= approvedAt) return 'return_approved';
  }
  if (s === 'return_approved' && order.returnApprovedAt) {
    const pickupAt = new Date(order.returnApprovedAt).getTime() + 4 * MS_HOUR;
    if (t >= pickupAt) return 'return_pickup_scheduled';
  }
  if (s === 'return_pickup_scheduled' && order.returnPickupScheduledAt) {
    const pickedAt = new Date(order.returnPickupScheduledAt).getTime() + 12 * MS_HOUR;
    if (t >= pickedAt) return 'return_picked_up';
  }

  return s;
}

export function isWithinReturnWindow(order, now = new Date()) {
  if (order.status !== 'delivered' && !order.deliveredAt) return false;
  const deliveredAt = new Date(order.deliveredAt || getDeliveryAt(order));
  const windowEnd = deliveredAt.getTime() + 15 * 24 * MS_HOUR;
  return now.getTime() <= windowEnd;
}

export function getStatusTimeline(order) {
  const placed = new Date(order.orderDate || Date.now());
  const delivery = new Date(getDeliveryAt(order));

  return [
    { key: 'confirmed', label: 'Order Confirmed', at: placed },
    { key: 'processing', label: 'Processing', at: new Date(placed.getTime() + H_PROCESSING * MS_HOUR) },
    { key: 'shipped', label: 'Shipped', at: new Date(placed.getTime() + H_SHIPPED * MS_HOUR) },
    { key: 'out_for_delivery', label: 'Out for Delivery', at: new Date(placed.getTime() + H_OUT_FOR_DELIVERY * MS_HOUR) },
    { key: 'delivered', label: 'Delivered', at: delivery },
  ];
}

export async function applyOrderLifecycle(order, { save = true } = {}) {
  if (!order || order.status === 'payment_pending') return order;

  const canonicalExpected = getExpectedDeliveryDate(order.orderDate);
  if (
    !order.expectedDeliveryDate ||
    order.expectedDeliveryDate.getTime() !== canonicalExpected.getTime()
  ) {
    order.expectedDeliveryDate = canonicalExpected;
  }

  const previous = order.status;
  let next = previous;
  const now = new Date();

  if (RETURN_STATUSES.includes(order.status)) {
    next = computeReturnStatus(order, now);
  } else if (!SKIP_AUTO.has(order.status) || order.status === 'pending') {
    next = computeFulfillmentStatus(order, now);
  }

  if (previous === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = order.statusUpdatedAt || now;
  }

  if (next !== previous) {
    order.status = next;
    order.statusUpdatedAt = now;

    if (next === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = now;
    }
    if (next === 'return_approved' && !order.returnApprovedAt) {
      order.returnApprovedAt = now;
    }
    if (next === 'return_pickup_scheduled' && !order.returnPickupScheduledAt) {
      order.returnPickupScheduledAt = now;
    }
    if (next === 'return_picked_up' && !order.returnPickedUpAt) {
      order.returnPickedUpAt = now;
    }

    if (save) await order.save();
  } else if (order.isModified?.() && save) {
    await order.save();
  }

  return order;
}
