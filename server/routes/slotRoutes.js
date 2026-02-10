const express = require('express');
const slotController = require('../controllers/slotController');

const router = express.Router();

// GET /api/slots/:date
router.get('/:date', slotController.getSlots);

// GET /api/slots/status/overall
router.get('/status/overall', slotController.getSlotStatus);

module.exports = router;
