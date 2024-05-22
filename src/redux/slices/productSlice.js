import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories:[],
  similarProducts:[],
  category:null,
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    getProductStart(state) {
      state.loading = true;
      state.error = null;
    },
    getProductSuccess(state, action) {
      state.products= action.payload;
      state.loading = false;
      state.error = null;
    },
    getProductFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    getProductsStart(state,action){
      state.loading=true;
      state.error=null;
    },
    getProductsSuccess(state,action){
      state.products=action.payload;
      state.loading=false;
      state.error=null;
    },
    getProductsFailure(state,action){
      state.loading=false;
      state.error=action.payload;
    },
    addProductStart(state) {
      state.loading = true;
      state.error = null;
    },
    addProductSuccess(state, action) {
      state.products.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    addProductFailure(state, action) {
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
    updateProductStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateProductSuccess(state, action) {
      state.loading = false;
      state.error = null;
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    updateProductFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    getProductByIdStart(state,action){
      state.error=null,
      state.loading=true
    },
    getProductByIdSuccess(state,action){
      state.category=action.payload
      state.products=action.payload
      state.loading=false
      state.error=null
    },
    getProductByIdFailure(state,action){
      state.loading=false
      state.error=action.payload
    },
    getSimilarProductStart(state){
      state.loading=true;
      state.error=null;
    },
    getSimilarProductSuccess(state,action){
      state.loading=false;
      state.error=null;
      state.similarProducts=action.payload;
    },
    getSimilarProductFailure(state,action){
      state.loading=false;
      state.error=action.payload
    }
  }
});

export const {
  getProductStart,
  getProductSuccess,
  getProductFailure,
  addProductStart,
  addProductSuccess,
  addProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailure,
  updateProductStart,
  updateProductSuccess,
  updateProductFailure,
  getProductsFailure,
  getProductsStart,
  getProductsSuccess,
  getProductByIdStart,
  getProductByIdSuccess,
  getProductByIdFailure,
  getCategoryByProductStart,
  getCategoryByProductSuccess,
  getCategoryByProductFailure,
  getSimilarProductFailure,
  getSimilarProductStart,
  getSimilarProductSuccess
} = productSlice.actions;

export default productSlice.reducer;
