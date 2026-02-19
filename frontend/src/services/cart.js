import axios from 'axios';
import API_BASE_URL from '../config';

const API_URL = API_BASE_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (user.id || user._id) {
        config.headers['user-id'] = user.id || user._id;
    }
    return config;
});

// Get cart
export const getCart = async () => {
    const response = await api.get('/cart');
    return response;
};

// Add to cart
export const addToCart = async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', {
        productId,
        quantity
    });
    return response;
};

// Update quantity
export const updateCartItem = async (productId, quantity) => {
    const response = await api.put(`/cart/update/${productId}`, {
        quantity
    });
    return response;
};

// Remove from cart
export const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response;
};

// Clear cart
export const clearCart = async () => {
    const response = await api.delete('/cart/clear');
    return response;
};