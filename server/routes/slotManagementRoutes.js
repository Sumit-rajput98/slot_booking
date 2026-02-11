const express = require('express');
const slotManagementController = require('../controllers/slotManagementController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

// Slot Configurations
router.get('/configurations', slotManagementController.getSlotConfigurations);
router.post('/configuration', slotManagementController.createSlotConfiguration);
router.put('/configuration/:id', slotManagementController.updateSlotConfiguration);
router.delete('/configuration/:id', slotManagementController.deleteSlotConfiguration);

// Recurring Rules
router.get('/recurring-rules', slotManagementController.getRecurringRules);
router.post('/recurring-rule', slotManagementController.createRecurringRule);
router.put('/recurring-rule/:id', slotManagementController.updateRecurringRule);
router.delete('/recurring-rule/:id', slotManagementController.deleteRecurringRule);

// Availability
router.get('/availability', slotManagementController.getSlotAvailability);

module.exports = router;
