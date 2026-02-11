const express = require('express');
const auditLogController = require('../controllers/auditLogController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get('/', auditLogController.getAuditLogs);
router.get('/stats', auditLogController.getAuditStats);
router.get('/export', auditLogController.exportAuditLogs);

module.exports = router;
