import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindOne = jest.fn();
const mockCategorySave = jest.fn();
const mockCategoryCtor = jest.fn(() => ({ save: mockCategorySave }));

jest.unstable_mockModule('../models/categoryModel.js', () => ({
  default: Object.assign(mockCategoryCtor, {
    findOne: mockFindOne,
  }),
}));

jest.unstable_mockModule('../models/productModel.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../utils/multer.js', () => ({
  cloudinary: { uploader: { destroy: jest.fn() } },
}));

const { createCategory } = await import('../controllers/categoryController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('categoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects empty category name', async () => {
    const req = { body: { name: '   ' } };
    const res = createRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Category name is required' });
  });

  it('rejects duplicate category name', async () => {
    mockFindOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'existing' }) });
    const req = { body: { name: 'Shoes' } };
    const res = createRes();

    await createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Category with this name already exists' });
  });
});
