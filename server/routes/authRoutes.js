import express from 'express';
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPasswordWithOtp,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);

export default router;

