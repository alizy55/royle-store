import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders',
    async (_, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

export const fetchSellerOrders = createAsyncThunk('orders/fetchSellerOrders',
    async (_, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.get(`${API_URL}/orders/seller/orders`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

export const createOrderThunk = createAsyncThunk('orders/createOrder',
    async (orderData, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.post(`${API_URL}/orders/create`, orderData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        customerOrders: [],
        sellerOrders: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.customerOrders = action.payload;
            })
            .addCase(fetchSellerOrders.fulfilled, (state, action) => {
                state.sellerOrders = action.payload;
            })
            .addCase(createOrderThunk.fulfilled, (state, action) => {
                state.customerOrders.unshift(action.payload);
            });
    }
});

export default orderSlice.reducer;