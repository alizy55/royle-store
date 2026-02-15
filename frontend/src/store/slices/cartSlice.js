import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, {
    getState
}) => {
    const {
        auth
    } = getState();
    const response = await axios.get(`${API_URL}/cart`, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    });
    return response.data.data;
});

export const addToCartThunk = createAsyncThunk('cart/addToCart',
    async ({
        productId,
        quantity
    }, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.post(`${API_URL}/cart/add`, {
            productId,
            quantity
        }, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

export const updateCartThunk = createAsyncThunk('cart/updateCart',
    async ({
        productId,
        quantity
    }, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.put(`${API_URL}/cart/update/${productId}`, {
            quantity
        }, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

export const removeFromCartThunk = createAsyncThunk('cart/removeFromCart',
    async (productId, {
        getState
    }) => {
        const {
            auth
        } = getState();
        const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        return response.data.data;
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalAmount: 0,
        loading: false,
        error: null
    },
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalAmount = action.payload.totalAmount;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addToCartThunk.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalAmount = action.payload.totalAmount;
            })
            .addCase(updateCartThunk.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalAmount = action.payload.totalAmount;
            })
            .addCase(removeFromCartThunk.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.totalAmount = action.payload.totalAmount;
            });
    }
});

export const {
    clearCart
} = cartSlice.actions;
export default cartSlice.reducer;