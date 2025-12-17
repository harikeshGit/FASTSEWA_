const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dataService = require('../services/dataService');
const excelService = require('../services/excelService');

// Get all users with details (admin only)
router.get('/users', async (req, res) => {
    try {
        const users = await dataService.getAllUsers();
        const stats = await dataService.getStats();
        
        res.json({
            success: true,
            stats: stats,
            total: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Get all bookings (admin only)
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await dataService.getAllBookings();
        const stats = await dataService.getStats();
        
        res.json({
            success: true,
            stats: stats,
            total: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// Get all services
router.get('/services', async (req, res) => {
    try {
        const services = await dataService.getAllServices();
        
        res.json({
            success: true,
            total: services.length,
            services: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services'
        });
    }
});

// Export all users to Excel
router.post('/export/users', async (req, res) => {
    try {
        const users = await dataService.getAllUsers();
        const result = await excelService.exportUsersToExcel(users);
        
        res.json({
            success: true,
            message: 'Users export completed successfully',
            data: result
        });
    } catch (error) {
        console.error('Users export error:', error);
        res.status(500).json({
            success: false,
            error: 'Users export failed'
        });
    }
});

// Export all bookings to Excel
router.post('/export/bookings', async (req, res) => {
    try {
        const bookings = await dataService.getAllBookings();
        const result = await excelService.exportBookingsToExcel(bookings);
        
        res.json({
            success: true,
            message: 'Bookings export completed successfully',
            data: result
        });
    } catch (error) {
        console.error('Bookings export error:', error);
        res.status(500).json({
            success: false,
            error: 'Bookings export failed'
        });
    }
});

// Export filtered users to Excel
router.post('/export/users/filtered', async (req, res) => {
    try {
        const filters = req.body;
        const result = await excelService.exportFilteredUsers(filters);
        
        res.json({
            success: true,
            message: 'Filtered users export completed',
            data: result
        });
    } catch (error) {
        console.error('Filtered users export error:', error);
        res.status(500).json({
            success: false,
            error: 'Filtered users export failed'
        });
    }
});

// Export filtered bookings to Excel
router.post('/export/bookings/filtered', async (req, res) => {
    try {
        const filters = req.body;
        const result = await excelService.exportFilteredBookings(filters);
        
        res.json({
            success: true,
            message: 'Filtered bookings export completed',
            data: result
        });
    } catch (error) {
        console.error('Filtered bookings export error:', error);
        res.status(500).json({
            success: false,
            error: 'Filtered bookings export failed'
        });
    }
});

// Get list of exported files
router.get('/exports', async (req, res) => {
    try {
        const files = await excelService.getExportedFiles();
        
        res.json({
            success: true,
            files: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get export list'
        });
    }
});

// Download exported file
router.get('/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../exports', filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Download failed'
        });
    }
});

// Delete exported file
router.delete('/exports/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const result = await excelService.deleteExportedFile(filename);
        
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
});

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await dataService.getStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
});

// Manage user (activate/deactivate)
router.patch('/users/:id/status', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { isActive } = req.body;
        
        const updatedUser = await dataService.updateUser(userId, { isActive });
        
        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Status update failed'
        });
    }
});

// Change user role
router.patch('/users/:id/role', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;
        
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be "admin" or "user"'
            });
        }
        
        const updatedUser = await dataService.updateUser(userId, { role });
        
        res.json({
            success: true,
            message: `User role changed to ${role}`,
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Role change failed'
        });
    }
});

// Update booking status
router.patch('/bookings/:id/status', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }
        
        const updatedBooking = await dataService.updateBooking(bookingId, { status });
        
        res.json({
            success: true,
            message: `Booking status updated to ${status}`,
            booking: updatedBooking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Booking update failed'
        });
    }
});

// Create new service
router.post('/services', async (req, res) => {
    try {
        const serviceData = req.body;
        const newService = await dataService.createService(serviceData);
        
        res.json({
            success: true,
            message: 'Service created successfully',
            service: newService
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Service creation failed'
        });
    }
});

module.exports = router;