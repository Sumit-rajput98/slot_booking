const express = require('express');
const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// POST /api/bookings
router.post('/', validateBooking, bookingController.createBooking);

// GET /api/user/weekly-status
router.get('/weekly-status', bookingController.getWeeklyStatus);

module.exports = router;
