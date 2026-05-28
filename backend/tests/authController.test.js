import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindOne = jest.fn();
const mockCompareSync = jest.fn();
const mockSign = jest.fn();

jest.unstable_mockModule('../models/userModel.js', () => ({
  default: { findOne: mockFindOne },
}));

jest.unstable_mockModule('../utils/error.js', () => ({
  errorHandler: (statusCode, message) => ({ statusCode, message }),
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: mockSign },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compareSync: mockCompareSync,
    hashSync: jest.fn(),
  },
}));

jest.unstable_mockModule('firebase-admin', () => ({
  default: { auth: jest.fn() },
}));

jest.unstable_mockModule('../models/otpModel.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../utils/emailService.js', () => ({
  sendOtpEmail: jest.fn(),
}));

const { signin } = await import('../controllers/authController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('authController signin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validation error when email/password is missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = createRes();
    const next = jest.fn();

    await signin(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'All fields are required' }),
    );
  });

  it('returns user and sets cookie for valid credentials', async () => {
    const validUser = {
      _id: 'u1',
      userType: 'user',
      password: 'hashed',
      _doc: { _id: 'u1', email: 'u@test.com', userType: 'user', password: 'hashed' },
    };
    mockFindOne.mockResolvedValue(validUser);
    mockCompareSync.mockReturnValue(true);
    mockSign.mockReturnValue('jwt-token');

    const req = { body: { email: 'u@test.com', password: 'Secret@123' } };
    const res = createRes();
    const next = jest.fn();

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'u1', email: 'u@test.com' }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
