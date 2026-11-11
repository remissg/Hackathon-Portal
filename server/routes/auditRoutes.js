import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Read-only governance log endpoint for Admin / Co-Admin inspection
router.get('/', protect, adminProtect, getAuditLogs);

export default router;

