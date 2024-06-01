import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: [],
    loading: false,
    error: null
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        getOrdersStart(state, action) {
            state.loading = true;
            state.error = null;
        },
        getOrdersSuccess(state, action) {
            state.orders = action.payload;
            state.loading = false;
            state.error = null;
        },
        getOrdersFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        updateOrderStatusStart(state,action){
            state.loading=true;
            state.error=null
        },
        updateOrderStatusSuccess: (state, action) => {
            state.error=null;
            state.loading=false;
            state.orders = state.orders.map((order) =>
                order._id === action.payload.orderId
                    ? { ...order, status: action.payload.status }
                    : order
            );
        },
        updateOrderStatusFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getAllAdminOrdersSuccess(state,action){
            state.orders=action.payload;
            state.loading=false;
            state.error=null;
        },
        getAllAdminOrdersFailure(state,action){
            state.loading=false;
            state.error=action.payload;
        },
        getAllAdminOrdersStart(state,action){
            state.loading=true;
            state.error=null;
        }
    }
});

export const { getAllAdminOrdersFailure,getAllAdminOrdersStart,getAllAdminOrdersSuccess,getOrdersFailure, getOrdersStart, getOrdersSuccess,updateOrderStatusFailure,updateOrderStatusStart,updateOrderStatusSuccess } = orderSlice.actions

export default orderSlice.reducer;