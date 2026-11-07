import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

/**
 * Dynamically create and configure Nodemailer Transporter
 * Strict rule from assignment:
 * - Always use MatruCare AI as sender name
 * - Always use matrucareai@gmail.com as the from address
 * - Authenticate via Gmail App Passwords for SMTP
 */
const getTransporter = (preferDirectSsl = true) => {
  const userEmail = (process.env.EMAIL_USER || '').trim();
  const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  if (preferDirectSsl) {
    // Port 465 direct SSL - most reliable on cloud container environments
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  // Fallback: Port 587 with STARTTLS
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: userEmail,
      pass: userPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

/**
 * Send an email with automatic fallback and logging
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');
  const userEmail = (process.env.EMAIL_USER || '').trim();

  const mailOptions = {
    from: '"MatruCare AI" <matrucareai@gmail.com>',
    to,
    subject,
    html,
    text: text || '',
  };

  const isConfigured = userPass && userPass.length > 0;

  if (!isConfigured) {
    console.log(`\n[NODEMAILER DEV LOG] EMAIL_PASS not configured in environment. Simulated send:`);
    console.log(`[NODEMAILER DEV LOG] To: ${to} | Subject: ${subject}`);
    const match = html.match(/letter-spacing:\s*8px;[^>]*>(\d{6})</);
    if (match) {
      console.log(`🔑 >>> [OTP CODE]: ${match[1]} <<<`);
    }
    return { success: true, simulated: true, messageId: 'mock-dev-id-' + Date.now() };
  }

  console.log(`[NODEMAILER] Dispatching email to: ${to} | From: "MatruCare AI" <matrucareai@gmail.com> | User: ${userEmail}...`);

  // Attempt 1: Direct SSL (service: 'gmail' / port 465)
  try {
    const transporter = getTransporter(true);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[NODEMAILER] Email sent successfully via Port 465! MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId, transport: 'port465' };
  } catch (err465) {
    console.warn(`[NODEMAILER] Port 465 failed (${err465.message}). Retrying via Port 587 STARTTLS...`);

    // Attempt 2: Fallback to Port 587 STARTTLS
    try {
      const fallbackTransporter = getTransporter(false);
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[NODEMAILER] Email sent successfully via Port 587! MessageId: ${info.messageId} to ${to}`);
      return { success: true, messageId: info.messageId, transport: 'port587' };
    } catch (err587) {
      console.error(`[NODEMAILER ERROR] Both Port 465 and Port 587 failed:`, {
        port465: err465.message,
        port587: err587.message,
      });

      // Extract OTP if present so it's always readable in server logs
      const match = html.match(/letter-spacing:\s*8px;[^>]*>(\d{6})</);
      if (match) {
        console.log(`🔑 >>> [OTP CODE IN LOGS]: ${match[1]} <<<`);
      }

      return {
        success: false,
        error: `Port 465: ${err465.message} | Port 587: ${err587.message}`,
      };
    }
  }
};

export default getTransporter(true);
