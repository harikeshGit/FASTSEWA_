const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all users (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await dataService.getAllUsers();
        
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await dataService.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = req.body;
        
        // Don't allow role change unless admin
        if (updates.role && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can change user roles'
            });
        }
        
        const updatedUser = await dataService.updateUser(userId, updates);
        
        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Update failed'
        });
    }
});

module.exports = router;