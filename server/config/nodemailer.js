import nodemailer from 'dotenv';
import nodemailerPackage from 'nodemailer';

/**
 * Configure Nodemailer Transporter
 * Strict rule: Sender must always be 'MatruCare AI' <matrucareai@gmail.com>
 */
const transporter = nodemailerPackage.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'matrucareai@gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
});

/**
 * Send an email with automatic fallback in development if credentials are empty
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"MatruCare AI" <${process.env.EMAIL_USER || 'matrucareai@gmail.com'}>`,
    to,
    subject,
    html,
    text: text || '',
  };

  const isConfigured =
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'your_gmail_app_password_here' &&
    process.env.EMAIL_PASS.trim().length > 0;

  if (!isConfigured) {
    console.log('\n======================================================');
    console.log(`[NODEMAILER DEV LOG] - From: ${mailOptions.from}`);
    console.log(`[NODEMAILER DEV LOG] - To: ${mailOptions.to}`);
    console.log(`[NODEMAILER DEV LOG] - Subject: ${mailOptions.subject}`);
    console.log('------------------------------------------------------');
    if (html.includes('Verification Code') || subject.includes('Verification Code')) {
      // Extract OTP if present in HTML
      const match = html.match(/letter-spacing:\s*8px;[^>]*>(\d{6})</);
      if (match) {
        console.log(`🔑 >>> [OTP CODE FOR TESTING]: ${match[1]} <<<`);
      }
    }
    console.log('======================================================\n');
    return { success: true, messageId: 'mock-dev-id-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to}: ${error.message}`);
    // In dev mode, return success so testing continues smoothly
    return { success: false, error: error.message };
  }
};

export default transporter;
