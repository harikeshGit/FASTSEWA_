const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { validateRegistration } = require('../middleware/authMiddleware');

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, email, password, profile } = req.body;
        
        const user = await dataService.registerUser({
            username,
            email,
            password,
            profile
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const result = await dataService.authenticateUser(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
});

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        // In real app, get from token
        res.json({
            success: true,
            user: {
                id: 1,
                username: 'current_user',
                email: 'user@example.com',
                role: 'user'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

module.exports = router;