import express from 'express';
import {
  registerHackathon,
  getMyEntry,
  updateEntry,
  deleteEntry,
  getAllRegistrations,
  getAdminStats,
  updateRegistrationStatus,
  getInvitationDetails,
  respondToInvitation,
  verifyPass,
  checkInPass,
} from '../controllers/hackathonController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Invitation & Pass Verification Lookups
router.get('/invite/:passId', getInvitationDetails);
router.get('/verify-pass/:passId', verifyPass);

// Participant Endpoints
router.post('/register', protect, registerHackathon);
router.get('/my-entry', protect, getMyEntry);
router.post('/respond-invite', protect, respondToInvitation);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

// Admin Endpoints
router.get('/admin/all', protect, adminProtect, getAllRegistrations);
router.get('/admin/stats', protect, adminProtect, getAdminStats);
router.patch('/admin/:id/status', protect, adminProtect, updateRegistrationStatus);
router.post('/admin/check-in', protect, adminProtect, checkInPass);

export default router;


