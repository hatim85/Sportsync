import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // categoryId: count
    categoryFrequency: {},
    trendingCategoryId: null,
};

const trendingSlice = createSlice({
    name: 'trending',
    initialState,
    reducers: {
        trackCategoryVisit: (state, action) => {
            const categoryId = action.payload;
            if (!categoryId) return;

            state.categoryFrequency[categoryId] = (state.categoryFrequency[categoryId] || 0) + 1;

            // Update trending category if this one has become the most frequent
            let maxCount = 0;
            let trendingId = state.trendingCategoryId;

            for (const id in state.categoryFrequency) {
                if (state.categoryFrequency[id] > maxCount) {
                    maxCount = state.categoryFrequency[id];
                    trendingId = id;
                }
            }
            state.trendingCategoryId = trendingId;
        },
        resetTrending: (state) => {
            state.categoryFrequency = {};
            state.trendingCategoryId = null;
        }
    }
});

export const { trackCategoryVisit, resetTrending } = trendingSlice.actions;
export default trendingSlice.reducer;
