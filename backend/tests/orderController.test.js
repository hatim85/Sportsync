import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindById = jest.fn();

jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { findById: mockFindById },
}));
jest.unstable_mockModule('../models/productModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/reviewModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../utils/orderLifecycle.js', () => ({
  getExpectedDeliveryDate: jest.fn(),
  applyOrderLifecycle: jest.fn(async (o) => o),
  isWithinReturnWindow: jest.fn(),
  getStatusTimeline: jest.fn(() => []),
}));
jest.unstable_mockModule('../utils/refundService.js', () => ({
  processOrderRefund: jest.fn(),
}));
jest.unstable_mockModule('../utils/orderAccess.js', () => ({
  userOwnsOrder: jest.fn(() => true),
  userMatchesParam: jest.fn(() => true),
}));

const { cancelOrder } = await import('../controllers/orderController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('orderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when cancelling missing order', async () => {
    mockFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const req = { params: { orderId: 'missing' } };
    const res = createRes();

    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
  });
});
