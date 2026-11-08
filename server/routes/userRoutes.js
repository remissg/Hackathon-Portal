import express from 'express';
import {
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);

// Admin Role Management
router.get('/admin/all', protect, adminProtect, getAllUsers);
router.patch('/admin/:id/role', protect, adminProtect, updateUserRole);

export default router;

