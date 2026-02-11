const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Admin authentication
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);
router.get('/admin/verify', authController.verifyAdminSession);

// User authentication (no password)
router.post('/user/login', authController.userLogin);

module.exports = router;
