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
let primaryTransporter = null;
let fallbackTransporter = null;

/**
 * Dynamically create and configure Nodemailer Transporter with Persistent Connection Pooling & IPv4
 * Strict rule from assignment:
 * - Always use MatruCare AI as sender name
 * - Always use matrucareai@gmail.com as the from address
 * - Authenticate via Gmail App Passwords for SMTP
 */
const getPrimaryTransporter = () => {
  if (!primaryTransporter) {
    const userEmail = (process.env.EMAIL_USER || '').trim();
    const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

    // Port 465 direct SSL with connection pooling & explicit IPv4
    primaryTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      family: 4, // Force IPv4 to eliminate 15-30s IPv6 resolution hangs on cloud containers
      auth: {
        user: userEmail,
        pass: userPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }
  return primaryTransporter;
};

const getFallbackTransporter = () => {
  if (!fallbackTransporter) {
    const userEmail = (process.env.EMAIL_USER || '').trim();
    const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

    // Fallback: Port 587 with STARTTLS & IPv4
    fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: userEmail,
        pass: userPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }
  return fallbackTransporter;
};

/**
 * Send an email with automatic fallback and logging
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const userPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');
  const userEmail = (process.env.EMAIL_USER || '').trim();

  // Unpack { html, text } if passed as an object
  let finalHtml = html;
  let finalText = text;
  if (typeof html === 'object' && html !== null) {
    finalHtml = html.html || '';
    finalText = text || html.text || '';
  }

  // Ensure plain-text alternative is always present to maximize inbox delivery & prevent spam flagging
  if (!finalText && typeof finalHtml === 'string') {
    finalText = finalHtml
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const mailOptions = {
    from: '"MatruCare AI" <matrucareai@gmail.com>',
    to,
    subject,
    html: finalHtml,
    text: finalText || '',
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

  // Attempt 1: Direct SSL (Port 465 with Connection Pooling & IPv4)
  try {
    const transporter = getPrimaryTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[NODEMAILER] Email sent successfully via Port 465! MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId, transport: 'port465' };
  } catch (err465) {
    console.warn(`[NODEMAILER] Port 465 failed (${err465.message}). Retrying via Port 587 STARTTLS...`);

    // Attempt 2: Fallback to Port 587 STARTTLS
    try {
      const fallbackTransporter = getFallbackTransporter();
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
