import { describe, it, expect, beforeAll } from 'vitest';

let cartReducer;
let addToCartGuest;
let updateQuantityGuest;
let removeFromCartGuest;

beforeAll(async () => {
  const store = new Map();
  global.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  const mod = await import('./cartSlice.js');
  cartReducer = mod.default;
  addToCartGuest = mod.addToCartGuest;
  updateQuantityGuest = mod.updateQuantityGuest;
  removeFromCartGuest = mod.removeFromCartGuest;
});

describe('cart slice', () => {
  it('adds guest item and increments same variant quantity', () => {
    const product = { _id: 'p1', name: 'Ball' };
    const first = cartReducer(undefined, addToCartGuest({ product, size: 'M', color: 'Red' }));
    const second = cartReducer(first, addToCartGuest({ product, size: 'M', color: 'Red' }));
    expect(second.cartItems).toHaveLength(1);
    expect(second.cartItems[0].quantity).toBe(2);
  });

  it('updates and removes guest cart item', () => {
    const product = { _id: 'p2', name: 'Cap' };
    const added = cartReducer(undefined, addToCartGuest({ product }));
    const id = added.cartItems[0].cartItemId;
    const updated = cartReducer(added, updateQuantityGuest({ cartItemId: id, quantity: 4 }));
    const removed = cartReducer(updated, removeFromCartGuest(id));
    expect(updated.cartItems[0].quantity).toBe(4);
    expect(removed.cartItems).toHaveLength(0);
  });
});
