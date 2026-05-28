import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFindById = jest.fn();

jest.unstable_mockModule('../models/cartItemModel.js', () => ({
  default: { findById: mockFindById },
}));

jest.unstable_mockModule('../models/cartModel.js', () => ({
  default: {},
}));

const { updateCartItemQuantity } = await import('../controllers/cartController.js');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('cartController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when cart item is not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = { params: { cartItemId: 'missing' }, body: { quantity: 2 } };
    const res = createRes();

    await updateCartItemQuantity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
  });

  it('updates quantity and returns value', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    mockFindById.mockResolvedValue({ quantity: 1, save });
    const req = { params: { cartItemId: 'c1' }, body: { quantity: 4 } };
    const res = createRes();

    await updateCartItemQuantity(req, res);

    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(4);
  });
});
