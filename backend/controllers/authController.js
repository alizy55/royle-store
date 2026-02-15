const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

// ======================
// ✅ REGISTRATION
// ======================
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            storeName
        } = req.body;

        // Validation
        const errors = [];
        if (!name || name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        if (!email || !validator.isEmail(email)) {
            errors.push('Please provide a valid email address');
        }
        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        if (role && !['customer', 'seller', 'admin'].includes(role)) {
            errors.push('Invalid role specified');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
                code: 'EMAIL_EXISTS'
            });
        }

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: role || 'customer',
            storeName: storeName || (role === 'seller' ? `${name}'s Store` : undefined),
            isPremium: false,
            isActive: true,
            emailVerified: false,
            loginCount: 0
        });

        await user.save();

        // Generate token
        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role,
                isPremium: user.isPremium
            },
            process.env.JWT_SECRET || 'your-secret-key-change-this', {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
                issuer: 'royal-store',
                audience: 'web-client'
            }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                token,
                tokenType: 'Bearer',
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    storeName: user.storeName,
                    isPremium: user.isPremium,
                    emailVerified: user.emailVerified
                }
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// ======================
// ✅ LOGIN
// ======================
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        console.log('🔐 Login attempt:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const user = await User.findOne({
                email: email.toLowerCase().trim()
            })
            .select('+password +isActive');

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                code: 'INVALID_PASSWORD'
            });
        }

        // Update login stats
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role,
                isPremium: user.isPremium
            },
            process.env.JWT_SECRET || 'your-secret-key-change-this', {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
                issuer: 'royal-store',
                audience: 'web-client'
            }
        );

        console.log('✅ Login successful:', email, 'Role:', user.role);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                tokenType: 'Bearer',
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    storeName: user.storeName,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    bio: user.bio,
                    logo: user.logo,
                    isPremium: user.isPremium,
                    emailVerified: user.emailVerified,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount
                }
            }
        });

    } catch (error) {
        console.error('🔥 Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed due to server error',
            code: 'SERVER_ERROR'
        });
    }
};

// ======================
// ✅ GET CURRENT USER
// ======================
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    storeName: user.storeName,
                    phone: user.phone || '',
                    address: user.address || '',
                    city: user.city || '',
                    country: user.country || '',
                    bio: user.bio || '',
                    logo: user.logo || '',
                    isPremium: user.isPremium,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount
                }
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
};

// ======================
// ✅ UPDATE PROFILE (FULL VERSION)
// ======================
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            storeName,
            phone,
            address,
            city,
            country,
            bio,
            logo
        } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name.trim();
        if (storeName !== undefined) user.storeName = storeName.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        if (city !== undefined) user.city = city.trim();
        if (country !== undefined) user.country = country.trim();
        if (bio !== undefined) user.bio = bio.trim();
        if (logo !== undefined) user.logo = logo.trim();

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    storeName: user.storeName,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    bio: user.bio,
                    logo: user.logo,
                    isPremium: user.isPremium,
                    emailVerified: user.emailVerified
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

// ======================
// ✅ FORGOT PASSWORD
// ======================
const forgotPassword = async (req, res) => {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({
            validateBeforeSave: false
        });

        res.json({
            success: true,
            message: 'Password reset email sent',
            token: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
};

// ======================
// ✅ RESET PASSWORD
// ======================
const resetPassword = async (req, res) => {
    try {
        const {
            token
        } = req.params;
        const {
            password
        } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
};

// ======================
// ✅ CHANGE PASSWORD
// ======================
const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// ======================
// ✅ LOGOUT
// ======================
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// ======================
// ✅ REFRESH TOKEN
// ======================
const refreshToken = async (req, res) => {
    try {
        const {
            refreshToken
        } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // In production, verify refresh token and issue new access token
        res.json({
            success: true,
            message: 'Token refresh endpoint',
            data: {
                token: 'new-token-placeholder',
                tokenType: 'Bearer',
                expiresIn: '7d'
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout,
    refreshToken
};