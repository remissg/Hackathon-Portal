import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT authentication token
 * Ensures only authenticated & verified users can access protected routes
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'matrucare_ai_super_secret_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      if (!req.user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please verify your OTP first.',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

/**
 * Middleware factory to restrict access to specific roles.
 * Super Admin (matrucareai@gmail.com or role 'admin') always has access.
 */
export const roleProtect = (...allowedRoles) => {
  return (req, res, next) => {
    const isOfficialAdmin =
      req.user?.email?.toLowerCase() === 'matrucareai@gmail.com' ||
      req.user?.role === 'admin';

    if (isOfficialAdmin || (req.user && allowedRoles.includes(req.user.role))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
    });
  };
};

/**
 * Middleware to restrict access to Admins only
 */
export const adminProtect = roleProtect('admin');

/**
 * Middleware to restrict access to Gate Volunteers and Admins
 */
export const volunteerProtect = roleProtect('volunteer', 'admin');

/**
 * Middleware to restrict access to Evaluators (Judges) and Admins
 */
export const evaluatorProtect = roleProtect('evaluator', 'admin');



