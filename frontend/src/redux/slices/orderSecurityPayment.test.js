import { describe, it, expect, vi, afterEach } from 'vitest';
import orderReducer, {
  updateOrderStatusSuccess,
  getOrdersSuccess,
} from './orderSlice.js';
import {
  STATUS_LABELS,
  canCancelOrder,
  canCancelReturn,
  shouldShowDeliveryEstimate,
  shouldShowDeliveredDate,
} from '../../utils/orderStatus.js';
import { apiFetch } from '../../utils/api.js';

describe('order/payment/security frontend behaviors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates order status in reducer', () => {
    const seeded = orderReducer(undefined, getOrdersSuccess([{ _id: 'o1', status: 'confirmed' }]));
    const updated = orderReducer(
      seeded,
      updateOrderStatusSuccess({ orderId: 'o1', status: 'shipped' }),
    );
    expect(updated.orders[0].status).toBe('shipped');
  });

  it('exposes payment/order lifecycle labels and transitions', () => {
    expect(STATUS_LABELS.payment_pending).toBe('Payment Pending');
    expect(canCancelOrder('processing')).toBe(true);
    expect(canCancelReturn('return_requested')).toBe(true);
    expect(shouldShowDeliveryEstimate('delivered')).toBe(false);
    expect(shouldShowDeliveredDate('delivered')).toBe(true);
    expect(shouldShowDeliveredDate('refunded')).toBe(false);
    expect(shouldShowDeliveredDate('cancelled')).toBe(false);
    expect(shouldShowDeliveredDate('failed')).toBe(false);
  });

  it('sends secure credentialed requests through apiFetch', async () => {
    const fakeResponse = { ok: true, status: 200 };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(fakeResponse);

    const res = await apiFetch('/api/orders/getadminorders');

    expect(res).toBe(fakeResponse);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/getadminorders'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });
});
