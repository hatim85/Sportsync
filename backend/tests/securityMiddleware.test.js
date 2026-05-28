import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockVerify = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: mockVerify },
}));

jest.unstable_mockModule('../utils/error.js', () => ({
  errorHandler: (statusCode, message) => ({ statusCode, message }),
}));

const { verifyToken } = await import('../utils/verifyUser.js');
const { verifyAdmin } = await import('../utils/verifyAdmin.js');

describe('security middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifyToken blocks request when token is missing', () => {
    const req = { cookies: {} };
    const res = {};
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: 'Unauthorized' }),
    );
  });

  it('verifyToken attaches user when jwt is valid', () => {
    const req = { cookies: { access_token: 'token' } };
    const res = {};
    const next = jest.fn();
    mockVerify.mockImplementation((token, secret, cb) => cb(null, { id: 'u1', userType: 'user' }));

    verifyToken(req, res, next);

    expect(req.user).toEqual({ id: 'u1', userType: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('verifyAdmin returns 403 for non-admin users', () => {
    const req = { user: { id: 'u1', userType: 'user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    const next = jest.fn();

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Only Admins can perform this action',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
