import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // addItem(state, action) {
        //     const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
        //     if (existingItemIndex !== -1) {
        //         // If item already exists in cart, update its quantity
        //         state.items[existingItemIndex].quantity += action.payload.quantity;
        //     } else {
        //         // If item doesn't exist in cart, add it
        //         state.items.push(action.payload);
        //     }
        // },
        // removeItem(state, action) {
        //     state.items = state.items.filter(item => item.id !== action.payload);
        // },
        // updateQuantity(state, action) {
        //     const { id, quantity } = action.payload;
        //     const itemToUpdate = state.items.find(item => item.id === id);
        //     if (itemToUpdate) {
        //         itemToUpdate.quantity = quantity;
        //     }
        // },
        // clearCart(state) {
        //     state.items = [];
        // },
        addCartItemSuccess(state, action) {
            // state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id);
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
            // state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
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
        }
    }
});

export const { addItem, removeCartItemSuccess, removeCartItemStart, removeCartItemFailure, updateQuantity, clearCart, addCartItemFailure, addCartItemStart, addCartItemSuccess, fetchCartItemsRequest, fetchCartItemsSuccess, fetchCartItemsFailure, updateCartItemQuantityStart, updateCartItemQuantitySuccess, updateCartItemQuantityFailure } = cartSlice.actions;

export default cartSlice.reducer;
