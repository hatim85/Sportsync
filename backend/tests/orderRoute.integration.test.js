import express from 'express';
import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockVerifyToken = jest.fn();
const mockVerifyAdmin = jest.fn();
const mockGetAllAdminOrders = jest.fn((req, res) =>
  res.status(200).json({ orders: [], totalOrders: 0 }),
);

jest.unstable_mockModule('../controllers/orderController.js', () => ({
  getAllAdminOrders: mockGetAllAdminOrders,
  getAllOrders: jest.fn(),
  updateStatus: jest.fn(),
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
  requestReturn: jest.fn(),
  cancelReturn: jest.fn(),
  cancelOrder: jest.fn(),
}));

jest.unstable_mockModule('../utils/verifyUser.js', () => ({
  verifyToken: mockVerifyToken,
}));

jest.unstable_mockModule('../utils/verifyAdmin.js', () => ({
  verifyAdmin: mockVerifyAdmin,
}));

const { default: orderRoute } = await import('../routes/orderRoute.js');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoute);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || 'Error' });
  });
  return app;
}

describe('order route integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks admin orders endpoint when token verification fails', async () => {
    mockVerifyToken.mockImplementation((req, res, next) =>
      res.status(401).json({ message: 'Unauthorized' }),
    );
    const app = buildApp();

    const res = await request(app).get('/api/orders/getadminorders');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('blocks admin orders endpoint for non-admin users', async () => {
    mockVerifyToken.mockImplementation((req, res, next) => next());
    mockVerifyAdmin.mockImplementation((req, res, next) =>
      res.status(403).json({ message: 'Unauthorized: Only Admins can perform this action' }),
    );
    const app = buildApp();

    const res = await request(app).get('/api/orders/getadminorders');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Only Admins/);
  });

  it('returns admin orders when token and role checks pass', async () => {
    mockVerifyToken.mockImplementation((req, res, next) => next());
    mockVerifyAdmin.mockImplementation((req, res, next) => next());
    const app = buildApp();

    const res = await request(app).get('/api/orders/getadminorders');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ orders: [], totalOrders: 0 });
    expect(mockGetAllAdminOrders).toHaveBeenCalledTimes(1);
  });
});
