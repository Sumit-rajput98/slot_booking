const express = require('express');
const userManagementController = require('../controllers/userManagementController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get('/', userManagementController.getAllUsers);
router.get('/stats', userManagementController.getUserStats);
router.post('/', userManagementController.createUser);
router.get('/:id', userManagementController.getUserById);
router.put('/:id/role', userManagementController.updateUserRole);
router.delete('/:id', userManagementController.deleteUser);

module.exports = router;
