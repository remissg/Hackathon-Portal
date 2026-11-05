import crypto from 'crypto';

/**
 * Generates a cryptographically strong 6-digit numeric OTP
 * @returns {string} 6-digit OTP string
 */
export const generateOtp = () => {
  // Generate random integer between 100000 and 999999 inclusive
  return crypto.randomInt(100000, 1000000).toString();
};

export default generateOtp;
