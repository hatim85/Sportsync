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
            const deletedAddressId = action.payload; // Assuming action.payload is the ID of the address to be deleted
            state.addresses = state.addresses.filter(address => address._id !== deletedAddressId);
            state.loading = false;
            state.error = null;
        },
        deleteAddressFailure(state, action) {
            state.loading = false;
            state.error = action.payload
        }
    }
})

export const { addAddressFailure, addAddressStart, addAddressSuccess, fetchAddressesFailure, fetchAddressesStart, fetchAddressesSuccess,deleteAddressFailure,deleteAddressStart,deleteAddressSuccess } = addressSlice.actions;

export default addressSlice.reducer;