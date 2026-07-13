const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            // Attach a convenience helper that checks primary role AND extra roles[]
            req.hasRole = (...roles) => hasRole(req.user, ...roles);
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Check whether a user has a given role.
 * Checks both the primary `role` field AND the `roles[]` extra-roles array
 * to support multi-role staff who may be acting under a secondary role.
 */
const hasRole = (user, ...roles) => {
    if (!user) return false;
    if (roles.includes(user.role)) return true;
    if (Array.isArray(user.roles) && user.roles.some(r => roles.includes(r))) return true;
    return false;
};

/**
 * Express middleware that enforces role-based access.
 * Accepts both primary role and extra roles[] array.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!hasRole(req.user, ...roles)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};

module.exports = { protect, authorize, hasRole };

