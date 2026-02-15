const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        try {
            // Check if user role exists
            if (!req.userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. User role not found.'
                });
            }

            // If requiredRole is an array, check if user has any of the roles
            if (Array.isArray(requiredRole)) {
                if (!requiredRole.includes(req.userRole)) {
                    return res.status(403).json({
                        success: false,
                        message: `Access denied. Requires one of: ${requiredRole.join(', ')}`
                    });
                }
            }
            // If requiredRole is a string, check for exact match
            else if (req.userRole !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Requires role: ${requiredRole}`
                });
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in role validation'
            });
        }
    };
};

module.exports = roleMiddleware;