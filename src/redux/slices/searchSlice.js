import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  searchResults: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchProductsStart(state, action) {
      state.loading = true;
      state.error = null;
    },
    searchProductsSuccess(state, action) {
      state.searchResults = action.payload;
      state.loading = false;
      state.error = null;
    },
    searchProductsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  searchProductsStart,
  searchProductsSuccess,
  searchProductsFailure,
} = searchSlice.actions;

export default searchSlice.reducer;
