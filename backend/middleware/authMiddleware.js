const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Access denied.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user info to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.role; // Make sure this is included

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Access denied.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

module.exports = {
    authMiddleware
};
// Note: roleMiddleware is NOT exported from this file