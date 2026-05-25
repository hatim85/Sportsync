import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    addresses: [],
    loading: false,
    error: null
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        fetchAddressesStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchAddressesSuccess(state, action) {
            state.loading = false;
            state.addresses = action.payload;
        },
        fetchAddressesFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        addAddressSuccess(state, action) {
            return {
                ...state,
                loading: false,
                addresses: [...state.addresses, action.payload] // Add the new address to the addresses array
            };
        },
        addAddressStart(state, action) {
            state.loading = true;
            state.error = null;
        },
        addAddressFailure(state, action) {
            state.loading = false;
            state.error = action.payload
        },
        deleteAddressStart(state, action) {
            state.loading = true;
            state.error = null;
        },
        deleteAddressSuccess(state, action) {
            const deletedAddressId = action.payload;
            state.addresses = state.addresses.filter(address => address._id !== deletedAddressId);
            state.loading = false;
            state.error = null;
        },
        deleteAddressFailure(state, action) {
            state.loading = false;
            state.error = action.payload
        },
        swapDefaultAddress(state, action) {
            const idx = action.payload; // index of the address to make default
            if (idx > 0 && idx < state.addresses.length) {
                const temp = state.addresses[0];
                state.addresses[0] = state.addresses[idx];
                state.addresses[idx] = temp;
            }
        }
    }
})

export const { addAddressFailure, addAddressStart, addAddressSuccess, fetchAddressesFailure, fetchAddressesStart, fetchAddressesSuccess, deleteAddressFailure, deleteAddressStart, deleteAddressSuccess, swapDefaultAddress } = addressSlice.actions;

export default addressSlice.reducer;