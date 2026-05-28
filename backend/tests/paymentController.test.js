import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockOrderFindById = jest.fn();
const mockGetDeliveryCharge = jest.fn();

jest.unstable_mockModule('../models/paymentModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/orderModel.js', () => ({
  default: { findById: mockOrderFindById },
}));
jest.unstable_mockModule('../models/productModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../index.js', () => ({
  instance: { orders: { create: jest.fn() } },
}));
jest.unstable_mockModule('../utils/pricing.js', () => ({
  getDeliveryCharge: mockGetDeliveryCharge,
}));
jest.unstable_mockModule('../utils/orderLifecycle.js', () => ({
  getExpectedDeliveryDate: jest.fn(() => new Date()),
}));
jest.unstable_mockModule('../utils/orderAccess.js', () => ({
  userOwnsOrder: jest.fn(() => true),
}));
jest.unstable_mockModule('../utils/webhookProcessor.js', () => ({
  verifyWebhookSignature: jest.fn(() => true),
  processRazorpayWebhook: jest.fn(async () => ({ event: 'ok' })),
}));

const { createPayment, paymentVerification } = await import('../controllers/paymentController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('paymentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when cart is empty in createPayment', async () => {
    mockGetDeliveryCharge.mockResolvedValue(50);
    const req = { user: { id: 'u1' }, body: { products: [], totalAmount: 0 } };
    const res = createRes();

    await createPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cart is empty' });
  });

  it('returns 400 when required fields are missing in paymentVerification', async () => {
    const req = { body: {} };
    const res = createRes();

    await paymentVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Missing payment fields',
    });
  });
});
