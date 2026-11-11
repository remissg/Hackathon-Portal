import express from 'express';
import {
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  provisionStaff,
  toggleStaffActive,
  deactivateMyRole,
} from '../controllers/userController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);
router.post('/deactivate-role', protect, deactivateMyRole);

// Admin Role & Staff Provisioning
router.get('/admin/all', protect, adminProtect, getAllUsers);
router.post('/admin/provision-staff', protect, adminProtect, provisionStaff);
router.patch('/admin/:id/toggle-active', protect, adminProtect, toggleStaffActive);
router.patch('/admin/:id/role', protect, adminProtect, updateUserRole);

export default router;

