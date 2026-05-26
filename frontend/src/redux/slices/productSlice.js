import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    getProductsStart(state) {
      state.loading = true;
      state.error = null;
    },
    getProductsSuccess(state, action) {
      state.products = action.payload.products ?? action.payload;
      state.loading = false;
      state.error = null;
    },
    getProductsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProductStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteProductSuccess(state, action) {
      state.products = state.products.filter(product => product._id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    deleteProductFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  }
});

export const {
  getProductsFailure,
  getProductsStart,
  getProductsSuccess,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailure,
} = productSlice.actions;

export default productSlice.reducer;
