import { describe, it, expect } from 'vitest';
import productReducer, {
  getProductsStart,
  getProductsSuccess,
  deleteProductSuccess,
} from './productSlice.js';
import categoryReducer, {
  createCategorySuccess,
  deleteCategorySuccess,
} from './categorySlice.js';

describe('product/category slices', () => {
  it('stores products from payload and clears loading', () => {
    const started = productReducer(undefined, getProductsStart());
    const state = productReducer(
      started,
      getProductsSuccess({ products: [{ _id: 'p1', name: 'Boots' }] }),
    );
    expect(state.loading).toBe(false);
    expect(state.products).toHaveLength(1);
  });

  it('deletes product by id from list', () => {
    const initial = {
      products: [{ _id: 'p1' }, { _id: 'p2' }],
      loading: false,
      error: null,
    };
    const state = productReducer(initial, deleteProductSuccess('p1'));
    expect(state.products).toEqual([{ _id: 'p2' }]);
  });

  it('creates and removes category correctly', () => {
    const created = categoryReducer(
      undefined,
      createCategorySuccess({ _id: 'c1', name: 'Shoes' }),
    );
    const deleted = categoryReducer(created, deleteCategorySuccess('c1'));
    expect(created.categories).toHaveLength(1);
    expect(deleted.categories).toHaveLength(0);
  });
});
