import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (userId, { rejectWithValue }) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/wishlist/${userId}`, {
                credentials: 'omit'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async ({ productId, userId }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/wishlist/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userId }),
                credentials: 'omit'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data.wishlist; // Backend returns updated wishlist array of IDs
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async ({ productId, userId }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/wishlist/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userId }),
                credentials: 'omit'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data.wishlist; // Backend returns updated wishlist array
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [], // Stores full product objects when populated
    wishlistIds: [], // Stores just IDs for quick check
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
            state.wishlistIds = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; // Payload is array of populated products
                state.wishlistIds = action.payload.map(item => item._id);
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.wishlistIds = action.payload; // Payload is array of IDs from backend
                // Note: items array might require separate fetch or optimistic update if we need full product details immediately
            })
            // Remove
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.wishlistIds = action.payload;
                // Filter out removed item from items array
                state.items = state.items.filter(item => action.payload.includes(item._id));
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
