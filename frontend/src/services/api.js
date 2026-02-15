import axios from 'axios';

// 🔴 CHANGE: localhost -> 127.0.0.1
const API = axios.create({
    baseURL: 'http://127.0.0.1:5000/api'
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const authAPI = {
    login: (email, password) => API.post('/auth/login', {
        email,
        password
    }),
    register: (userData) => API.post('/auth/register', userData),
    getMe: () => API.get('/auth/me'),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export default API;