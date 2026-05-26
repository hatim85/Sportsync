import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: JSON.parse(localStorage.getItem('guestCart')) || [],
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCartGuest(state, action) {
            const { product, size, color } = action.payload;

            const existingItemIndex = state.cartItems.findIndex(item =>
                item.product?._id === product?._id &&
                (item.size === size || (!item.size && !size)) &&
                (item.color === color || (!item.color && !color))
            );

            if (existingItemIndex !== -1) {
                state.cartItems[existingItemIndex].quantity += 1;
            } else {
                state.cartItems.push({
                    cartItemId: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    product,
                    size,
                    color,
                    quantity: 1,
                    isGuest: true
                });
            }
            localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
        },
        removeFromCartGuest(state, action) {
            state.cartItems = state.cartItems.filter(item => item.cartItemId !== action.payload);
            localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
        },
        updateQuantityGuest(state, action) {
            const { cartItemId, quantity } = action.payload;
            const item = state.cartItems.find(i => i.cartItemId === cartItemId);
            if (item) {
                item.quantity = quantity;
            }
            localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
        },
        syncCart(state, action) {
            state.cartItems = action.payload;
            localStorage.removeItem('guestCart');
        },
        addCartItemSuccess(state, action) {
            state.loading = false;
            state.error = null;
            state.cartItems = action.payload;
        },
        addCartItemFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
        addCartItemStart(state, action) {
            state.loading = true;
            state.error = null;
        },
        fetchCartItemsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        fetchCartItemsSuccess(state, action) {
            state.cartItems = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchCartItemsFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        removeCartItemSuccess(state, action) {
            state.loading = false;
            state.error = null;
            state.cartItems = state.cartItems.filter(item => item.cartItemId !== action.payload);
        },
        removeCartItemFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
        removeCartItemStart(state) {
            state.loading = true;
            state.error = null;
        },
        updateCartItemQuantityStart(state) {
            state.loading = true;
            state.error = null;
        },
        updateCartItemQuantitySuccess(state, action) {
            state.loading = false;
            const updatedCartItems = state.cartItems.map(item => {
                if (item.cartItemId === action.payload.cartItemId) {
                    const updatedItem = { ...item, quantity: action.payload.quantity };
                    return updatedItem;
                }
        
                return item;
            });
        
            state.cartItems = updatedCartItems;
        },            
        
        updateCartItemQuantityFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        clearCart(state) {
            state.cartItems = [];
            localStorage.removeItem('guestCart');
        }
    }
});

export const { 
    addToCartGuest, 
    removeFromCartGuest, 
    updateQuantityGuest, 
    syncCart,
    removeCartItemSuccess, 
    removeCartItemStart, 
    removeCartItemFailure, 
    clearCart, 
    addCartItemFailure, 
    addCartItemStart, 
    addCartItemSuccess, 
    fetchCartItemsRequest, 
    fetchCartItemsSuccess, 
    fetchCartItemsFailure, 
    updateCartItemQuantityStart, 
    updateCartItemQuantitySuccess, 
    updateCartItemQuantityFailure 
} = cartSlice.actions;

export default cartSlice.reducer;
