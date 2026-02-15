import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add user-id header for all requests
    if (user.id || user._id) {
        config.headers['user-id'] = user.id || user._id;
    }
    return config;
});

// Get all products (for customers)
export const getProducts = async () => {
    const response = await api.get('/products');
    return response;
};

// Get seller products
export const getMyProducts = async (sellerId) => {
    const response = await api.get(`/products/seller/${sellerId}`);
    return response;
};

// Create product with images
export const createProductWithImages = async (formData) => {
    const response = await api.post('/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

// Update product with images
export const updateProductWithImages = async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

// Delete product - UPDATED to use the interceptor which now adds user-id
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response;
};

// Keep original functions for backward compatibility
export const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response;
};