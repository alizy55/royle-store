import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

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

// Get all active categories (public)
export const getCategories = async () => {
    const response = await api.get('/categories');
    return response;
};

// Get all categories including inactive (admin)
export const getAllCategories = async () => {
    const response = await api.get('/categories/all');
    return response;
};

// Get single category
export const getCategory = async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response;
};

// Create category (admin)
export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response;
};

// Update category (admin)
export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response;
};

// Delete category (admin)
export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
};