import express from 'express';
import { submitContact, getContactMessages } from '../controllers/contactController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, adminProtect, getContactMessages);

export default router;

