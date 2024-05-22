import {createSlice} from '@reduxjs/toolkit'

const initialState={
    categories:[],
    categoryProducts:null,
    loading:false,
    error:null
}

const categorySlice=createSlice({
    name:'category',
    initialState,
    reducers:{
        getCategoryStart:(state)=>{
            state.loading=true;
            state.error=null;
        },
        getCategorySuccess:(state,action)=>{
            state.categories=action.payload;
            state.loading=false;
            state.error=null;
        },
        getCategoryFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        createCategoryStart:(state)=>{
            state.loading=true;
            state.error=null;
        },
        createCategorySuccess:(state,action)=>{
            state.categories.push(action.payload);
            state.loading=false;
            state.error=null;
        },
        createCategoryFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        deleteCategoryStart:(state)=>{
            state.loading=true;
            state.error=null;
        },
        deleteCategorySuccess:(state,action)=>{
            state.categories=state.categories.filter((category)=>category._id!==action.payload);
            state.loading=false;
            state.error=null;
        },
        deleteCategoryFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        updateCategoryStart:(state)=>{
            state.loading=true;
            state.error=null;
        },
        updateCategorySuccess:(state,action)=>{
            state.loading=false;
            state.error=null;
            const index=state.categories.findIndex(category=>category._id===action.payload._id);
            if(index!==-1){
                state.categories[index]=action.payload;
            }
        },
        updateCategoryFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        getCategoryProductStart:(state,action)=>{
            state.loading=true;
            state.error=null
        },
        getCategoryProductSuccess:(state,action)=>{
            state.categoryProducts=action.payload;
            state.loading=false;
            state.error=null;
        },
        getCategoryProductFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        }
    }
})

export const {
    getCategoryStart,
    getCategorySuccess,
    getCategoryFailure,
    createCategoryStart,
    createCategorySuccess,
    createCategoryFailure,
    deleteCategoryStart,
    deleteCategorySuccess,
    deleteCategoryFailure,
    updateCategoryStart,
    updateCategorySuccess,
    updateCategoryFailure,
    getCategoryProductStart,
    getCategoryProductSuccess,
    getCategoryProductFailure
}=categorySlice.actions

export default categorySlice.reducer;