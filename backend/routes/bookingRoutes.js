const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all bookings for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const bookings = await dataService.getAllBookings();
        const userBookings = bookings.filter(booking => booking.userId === req.user.userId);
        
        res.json({
            success: true,
            bookings: userBookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { serviceId, serviceName, bookingDate, bookingTime, notes } = req.body;
        
        // Get user details
        const user = await dataService.getUserById(req.user.userId);
        
        const bookingData = {
            userId: req.user.userId,
            serviceId,
            serviceName,
            userName: user.profile?.name || user.username,
            userEmail: user.email,
            bookingDate,
            bookingTime,
            notes,
            amount: req.body.amount || 0,
            status: 'pending'
        };
        
        const newBooking = await dataService.createBooking(bookingData);
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Booking creation failed'
        });
    }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const booking = await dataService.getBookingById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Check if user owns the booking or is admin
        if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        res.json({
            success: true,
            booking: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking'
        });
    }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const booking = await dataService.getBookingById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Check if user owns the booking
        if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        const updates = req.body;
        const updatedBooking = await dataService.updateBooking(bookingId, updates);
        
        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking: updatedBooking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Booking update failed'
        });
    }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const booking = await dataService.getBookingById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Check if user owns the booking
        if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        await dataService.deleteBooking(bookingId);
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Booking cancellation failed'
        });
    }
});

module.exports = router;