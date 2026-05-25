import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    error: null,
    payment: null
}

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        createPaymentStart(state) {
            state.loading = true;
            state.error = null;
        },
        createPaymentSuccess(state, action) {
            state.loading = false;
            state.payment = action.payload;
        },
        createPaymentFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const {createPaymentFailure,createPaymentStart,createPaymentSuccess}=paymentSlice.actions
export default paymentSlice.reducer;