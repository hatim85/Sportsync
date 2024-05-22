import { applyMiddleware, combineReducers, configureStore, createStore } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice.js'
import categoryReducer from './slices/categorySlice.js'
import productReducer from './slices/productSlice.js'
import searchReducer from './slices/searchSlice.js'
import cartReducer from './slices/cartSlice.js'
import addressReducer from './slices/addressSlice.js'
import paymentReducer from './slices/paymentSlice.js'
import orderReducer from './slices/orderSlice.js'
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";

// export const store=configureStore({
//     reducer:{
//         user:userReducer
//     }
// });

const rootReducer=combineReducers({
    user:userReducer,
    category:categoryReducer,
    product:productReducer,
    cart:cartReducer,
    search:searchReducer,
    address:addressReducer,
    payment:paymentReducer,
    order:orderReducer,
})

const persistConfig={
    key:'root',
    storage,
    version:1
}

const persistedReducer=persistReducer(persistConfig,rootReducer);

// export const store=configureStore({
//     reducer:persistedReducer,
//     middleware:(getDefaultMiddleware)=>
//         getDefaultMiddleware({serializableCheck:false})
// });
const store=createStore(persistedReducer);
export const persistor=persistStore(store);
export default store;
// export const persistor=persistStore(store);