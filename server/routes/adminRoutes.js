const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// GET /api/admin/bookings
router.get('/bookings', adminController.getAllBookings);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', adminController.deleteBooking);

// DELETE /api/admin/bookings (bulk delete)
router.delete('/bookings', adminController.deleteMultipleBookings);

// GET /api/admin/export
router.get('/export', adminController.exportBookings);

module.exports = router;
