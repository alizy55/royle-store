import {
    configureStore
} from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        products: productReducer,
        orders: orderReducer,
        auth: authReducer
    }
});