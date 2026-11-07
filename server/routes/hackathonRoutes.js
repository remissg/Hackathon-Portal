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
} from '../controllers/hackathonController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Invitation Lookup
router.get('/invite/:passId', getInvitationDetails);

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

export default router;


