import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Protected Route Component
const ProtectedRoute = ({
    children,
    allowedRoles
}) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return < Navigate to = "/login"
        replace / > ;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return < Navigate to = "/login"
        replace / > ;
    }

    return children;
};

function App() {
    return ( <
        ErrorBoundary >
        <
        Router >
        <
        Routes >
        <
        Route path = "/login"
        element = {
            < Login / >
        }
        />

        <
        Route path = "/admin"
        element = {
            <
            ProtectedRoute allowedRoles = {
                ['admin']
            } >
            <
            AdminDashboard / >
            <
            /ProtectedRoute>
        }
        />

        <
        Route path = "/seller"
        element = {
            <
            ProtectedRoute allowedRoles = {
                ['seller']
            } >
            <
            SellerDashboard / >
            <
            /ProtectedRoute>
        }
        />

        <
        Route path = "/customer"
        element = {
            <
            ProtectedRoute allowedRoles = {
                ['customer']
            } >
            <
            CustomerDashboard / >
            <
            /ProtectedRoute>
        }
        />

        <
        Route path = "/"
        element = {
            < Navigate to = "/login"
            replace / >
        }
        /> <
        /Routes> <
        /Router> <
        /ErrorBoundary>
    );
}

export default App;