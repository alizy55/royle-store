import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL
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

// Create order
export const createOrder = async (orderData) => {
    const response = await api.post('/orders/create', orderData);
    return response;
};

// Get customer orders
export const getMyOrders = async () => {
    const response = await api.get('/orders/my-orders');
    return response;
};

// Get seller orders
export const getSellerOrders = async () => {
    const response = await api.get('/orders/seller/orders');
    return response;
};

// Update order status (for sellers)
export const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, {
        status
    });
    return response;
};

// Get all orders (admin)
export const getAllOrders = async () => {
    const response = await api.get('/orders/all');
    return response;
};

// Get single order
export const getOrder = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
};