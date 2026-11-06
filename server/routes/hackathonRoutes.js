import express from 'express';
import {
  registerHackathon,
  getMyEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/hackathonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerHackathon);
router.get('/my-entry', protect, getMyEntry);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

export default router;

