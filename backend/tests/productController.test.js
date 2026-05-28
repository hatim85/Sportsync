import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindById = jest.fn();
const mockFormatProductDoc = jest.fn((p) => p);

jest.unstable_mockModule('../models/productModel.js', () => ({
  default: { findById: mockFindById },
}));
jest.unstable_mockModule('../models/categoryModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/reviewModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../models/orderModel.js', () => ({ default: {} }));
jest.unstable_mockModule('../utils/error.js', () => ({ errorHandler: jest.fn() }));
jest.unstable_mockModule('../utils/pricing.js', () => ({
  formatProductDoc: mockFormatProductDoc,
}));
jest.unstable_mockModule('../utils/multer.js', () => ({
  cloudinary: { uploader: { destroy: jest.fn() } },
  default: {},
}));

const { getProduct } = await import('../controllers/productController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('productController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when product does not exist', async () => {
    mockFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const req = { params: { productId: 'missing' }, query: {} };
    const res = createRes();
    const next = jest.fn();

    await getProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });
});
