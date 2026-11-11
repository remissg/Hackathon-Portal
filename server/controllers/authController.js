import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateOtp } from '../utils/generateOtp.js';
import { sendMail } from '../config/nodemailer.js';
import {
  generateOtpEmailTemplate,
  generatePasswordResetOtpTemplate,
} from '../utils/emailTemplates.js';

/**
 * Generate JWT Token helper
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'matrucare_ai_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new user & trigger 6-digit OTP email
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log(`[AUTH] Incoming signup request for: ${email}`);

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account with this email already exists. Please login.',
      });
    }

    if (!user) {
      // Create fresh user in unverified state
      user = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        isVerified: false,
      });
    } else {
      // Update details for re-attempt before verification
      user.fullName = fullName.trim();
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
    }

    // Generate 6-digit OTP
    const otpCode = generateOtp();
    console.log(`[AUTH] Created OTP: ${otpCode} for user: ${normalizedEmail}`);

    // Invalidate existing verification OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail, purpose: { $ne: 'password_reset' } });

    // Store new OTP in DB with 10-minute expiry
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'verification',
    });

    // Send OTP via Nodemailer
    const otpEmail = generateOtpEmailTemplate({ otp: otpCode, expiryMinutes: 10 });
    const mailResult = await sendMail({
      to: normalizedEmail,
      subject: 'HackSphere — Your 6-Digit Verification Code',
      html: otpEmail.html,
      text: otpEmail.text,
    });

    console.log(`[AUTH] Mail dispatch status:`, mailResult.success ? 'Delivered' : `Failed: ${mailResult.error}`);

    return res.status(201).json({
      success: true,
      message: mailResult.success
        ? 'Signup initiated. A 6-digit verification code has been sent to your email (check Inbox & Spam).'
        : 'Account created! Verification code ready below (Cloud host blocked SMTP ports).',
      email: normalizedEmail,
      otp: otpCode,
    });
  } catch (error) {
    console.error('[Signup Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during signup',
    });
  }
};

/**
 * @desc    Verify 6-digit OTP and activate account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit OTP',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find verification OTP record
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: cleanOtp,
      purpose: { $ne: 'password_reset' },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new code.',
      });
    }

    // Activate User
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Invalidate/delete verification OTP after successful verification
    await Otp.deleteMany({ email: normalizedEmail, purpose: { $ne: 'password_reset' } });

    return res.status(200).json({
      success: true,
      message: 'Email successfully verified! You may now log in to your account.',
    });
  } catch (error) {
    console.error('[Verify OTP Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification',
    });
  }
};

/**
 * @desc    Resend a fresh 6-digit OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. Please proceed to login.',
      });
    }

    // Generate new OTP
    const otpCode = generateOtp();

    // Clear old verification OTPs
    await Otp.deleteMany({ email: normalizedEmail, purpose: { $ne: 'password_reset' } });

    // Save new OTP
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'verification',
    });

    // Send email
    const otpEmail = generateOtpEmailTemplate({ otp: otpCode, expiryMinutes: 10 });
    const mailResult = await sendMail({
      to: normalizedEmail,
      subject: 'HackSphere — New Verification Code',
      html: otpEmail.html,
      text: otpEmail.text,
    });

    console.log(`[AUTH] Resend OTP dispatch status:`, mailResult.success ? 'Delivered' : `Failed: ${mailResult.error}`);

    return res.status(200).json({
      success: true,
      message: mailResult.success
        ? 'A fresh 6-digit OTP has been sent to your email address (check Inbox & Spam).'
        : 'Fresh verification code generated! (Cloud host blocked SMTP; code provided below)',
      otp: otpCode,
    });
  } catch (error) {
    console.error('[Resend OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resending OTP',
    });
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Check verification status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        message: 'Your account is not verified yet. Please verify your OTP.',
        email: user.email,
      });
    }

    // Check if account is active (not deactivated by admin)
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account access has been deactivated by the administrator. Please contact event support.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Issue JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        mobileNumber: user.mobileNumber || '',
        collegeName: user.collegeName || '',
        course: user.course || '',
        branch: user.branch || '',
        yearOfStudy: user.yearOfStudy || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        headline: user.headline || '',
        skills: user.skills || [],
        bio: user.bio || '',
      },
    });
  } catch (error) {
    console.error('[Login Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Send a 6-digit password reset OTP to verified account email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account has not been verified yet. Please verify your signup OTP first.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This account access has been deactivated by the administrator. Please contact support.',
      });
    }

    const otpCode = generateOtp();

    // Clear previous password reset OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password_reset' });

    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'password_reset',
    });

    const resetEmail = generatePasswordResetOtpTemplate({
      fullName: user.fullName || 'Participant',
      otp: otpCode,
      expiryMinutes: 10,
    });

    const mailResult = await sendMail({
      to: normalizedEmail,
      subject: 'HackSphere — Password Reset OTP Verification Code',
      html: resetEmail.html,
      text: resetEmail.text,
    });

    console.log(
      `[AUTH] Password reset OTP for ${normalizedEmail}:`,
      mailResult.success ? 'Delivered' : `Failed: ${mailResult.error}`
    );

    if (!mailResult.success) {
      return res.status(503).json({
        success: false,
        message: 'Unable to dispatch OTP email right now. Please contact matrucareai@gmail.com or try again shortly.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit password reset OTP has been sent to ${normalizedEmail}. Check your Inbox and Spam folder.`,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while initiating password reset',
    });
  }
};

/**
 * @desc    Verify reset OTP and update user password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, 6-digit OTP, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: cleanOtp,
      purpose: 'password_reset',
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset OTP. Please request a fresh code.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated by the administrator.',
      });
    }

    // Password is automatically hashed by User pre-save hook
    user.password = newPassword;
    await user.save();

    // Invalidate all password reset OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password_reset' });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resetting password',
    });
  }
};

