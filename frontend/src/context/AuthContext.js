import React, {
    createContext,
    useState,
    useContext,
    useEffect
} from 'react';
import {
    authAPI
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({
    children
}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            } else {
                // Clean up invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);

            if (response.success) {
                const userData = response.data.user || response.data;
                const token = response.data.token || response.token;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return {
                    success: true,
                    user: userData
                };
            }
            return {
                success: false,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller',
        isCustomer: user?.role === 'customer'
    };

    return ( <
        AuthContext.Provider value = {
            value
        } > {
            !loading && children
        } <
        /AuthContext.Provider>
    );
};