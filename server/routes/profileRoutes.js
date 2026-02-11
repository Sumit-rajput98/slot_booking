const express = require('express');
const profileController = require('../controllers/profileController');

const router = express.Router();

// GET /api/profile/:armyNumber
router.get('/:armyNumber', profileController.getProfile);

// POST /api/profile (create or update)
router.post('/', profileController.saveProfile);

// DELETE /api/profile/:armyNumber
router.delete('/:armyNumber', profileController.deleteProfile);

module.exports = router;
