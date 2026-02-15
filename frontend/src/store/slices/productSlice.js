import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data.data;
});

export const fetchSellerProducts = createAsyncThunk('products/fetchSellerProducts',
    async (sellerId) => {
        const response = await axios.get(`${API_URL}/products/seller/${sellerId}`);
        return response.data.data;
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        sellerItems: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchSellerProducts.fulfilled, (state, action) => {
                state.sellerItems = action.payload;
            });
    }
});

export default productSlice.reducer;