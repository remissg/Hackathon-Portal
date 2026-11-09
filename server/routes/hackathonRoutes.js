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
  submitEvaluation,
  getEvaluatorSubmissions,
  getPublicLeaderboard,
} from '../controllers/hackathonController.js';
import {
  protect,
  adminProtect,
  volunteerProtect,
  evaluatorProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Endpoints (Leaderboard, Pass Verification & Team Invitations)
router.get('/leaderboard', getPublicLeaderboard);
router.get('/invite/:passId', getInvitationDetails);
router.get('/verify-pass/:passId', verifyPass);

// Participant Endpoints
router.post('/register', protect, registerHackathon);
router.get('/my-entry', protect, getMyEntry);
router.post('/respond-invite', protect, respondToInvitation);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

// Evaluator / Judge Endpoints
router.get('/evaluator/submissions', protect, evaluatorProtect, getEvaluatorSubmissions);
router.post('/:id/evaluate', protect, evaluatorProtect, submitEvaluation);

// Gate Volunteer & Admin Check-In Endpoint
router.post('/admin/check-in', protect, volunteerProtect, checkInPass);

// Admin Governance Endpoints
router.get('/admin/all', protect, adminProtect, getAllRegistrations);
router.get('/admin/stats', protect, adminProtect, getAdminStats);
router.patch('/admin/:id/status', protect, adminProtect, updateRegistrationStatus);

export default router;


