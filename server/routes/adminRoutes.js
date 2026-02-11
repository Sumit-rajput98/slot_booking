const express = require('express');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All admin routes require authentication
router.use(adminAuth);

// Bookings
router.get('/bookings', adminController.getAllBookings);
router.delete('/bookings/:id', adminController.deleteBooking);
router.delete('/bookings', adminController.deleteMultipleBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Stats & Analytics
router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAnalytics);

// Export
router.get('/export', adminController.exportBookings);

module.exports = router;
