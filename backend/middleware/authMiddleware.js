const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            error: 'Admin access required' 
        });
    }
};

// Log requests
const logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
};

// Validate registration input
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    logRequest,
    validateRegistration
};