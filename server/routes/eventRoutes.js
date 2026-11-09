import express from 'express';
import {
  getPublicEvents,
  getEventBySlugOrId,
  getAllProblemStatements,
  createHackathonEvent,
  updateHackathonEvent,
  deleteHackathonEvent,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
} from '../controllers/eventController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPublicEvents);
router.get('/problems/all', getAllProblemStatements);
router.get('/:slugOrId', getEventBySlugOrId);

// Admin-protected event governance
router.post('/', protect, adminProtect, createHackathonEvent);
router.put('/:id', protect, adminProtect, updateHackathonEvent);
router.delete('/:id', protect, adminProtect, deleteHackathonEvent);

// Admin problem statement management
router.post('/:id/problems', protect, adminProtect, addProblemStatement);
router.put('/:id/problems/:problemId', protect, adminProtect, updateProblemStatement);
router.delete('/:id/problems/:problemId', protect, adminProtect, deleteProblemStatement);

export default router;

