import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const userEmail = (process.env.EMAIL_USER || '').trim();
// Remove spaces if user copied 16-char app password in groups like 'abcd efgh ijkl mnop'
const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

/**
 * Configure Nodemailer Transporter
 * Strict rule from assignment:
 * - Always use MatruCare AI as sender name
 * - Always use matrucareai@gmail.com as the from address
 * - Authenticate via Gmail App Passwords for SMTP
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // port 587 with STARTTLS
  auth: {
    user: userEmail,
    pass: userPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 8000, // 8s timeout
  greetingTimeout: 8000,
  socketTimeout: 10000,
});

/**
 * Send an email with automatic fallback and logging
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: '"MatruCare AI" <matrucareai@gmail.com>',
    to,
    subject,
    html,
    text: text || '',
  };

  const isConfigured =
    userPass &&
    userPass !== 'your_gmail_app_password_here' &&
    userPass.length > 0;

  if (!isConfigured) {
    console.log(`\n[NODEMAILER DEV LOG] Credentials not configured. Simulated send:`);
    console.log(`[NODEMAILER DEV LOG] To: ${to} | Subject: ${subject}`);
    const match = html.match(/letter-spacing:\s*8px;[^>]*>(\d{6})</);
    if (match) {
      console.log(`🔑 >>> [OTP CODE]: ${match[1]} <<<`);
    }
    return { success: true, messageId: 'mock-dev-id-' + Date.now() };
  }

  console.log(`[NODEMAILER] Dispatching email to: ${to} | Subject: "${subject}"...`);

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP connection timed out after 8 seconds')), 8000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`[NODEMAILER] Email sent successfully! MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[NODEMAILER ERROR] Failed to send email to ${to}: ${error.message}`);
    // Extract OTP if present so it's always readable in Render logs
    const match = html.match(/letter-spacing:\s*8px;[^>]*>(\d{6})</);
    if (match) {
      console.log(`🔑 >>> [OTP CODE FOR TESTING]: ${match[1]} <<<`);
    }
    return { success: false, error: error.message };
  }
};

export default transporter;
