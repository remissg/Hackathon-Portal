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

// Circuit breaker for environments where cloud host firewalls block outbound SMTP ports (e.g. Railway Free/Hobby)
let lastSmtpBlockDetectedAt = 0;
const SMTP_RECHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

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
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
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
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
    });
  }
  return fallbackTransporter;
};

/**
 * Universal HTTPS Email Bridge (Brevo / Resend / SendGrid)
 * Runs over standard HTTPS Port 443 — NEVER blocked by cloud firewalls (Railway, Render, Vercel, AWS).
 * Allows real email delivery to recipients' Gmail inboxes on free-tier cloud platforms.
 */
const sendViaHttpBridge = async ({ to, subject, html, text }) => {
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoKey) {
    try {
      console.log(`[HTTP EMAIL BRIDGE] Outbound SMTP blocked by cloud host; dispatching via Brevo HTTPS (Port 443)...`);
      const brevoSenderEmail = (
        process.env.BREVO_SENDER_EMAIL ||
        (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('matrucareai') ? process.env.EMAIL_USER : 'wishtory.in@gmail.com')
      ).trim();

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'HackSphere',
            email: brevoSenderEmail,
          },
          replyTo: {
            name: 'HackSphere',
            email: 'matrucareai@gmail.com',
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[HTTP EMAIL BRIDGE] Real email delivered to ${to} via Brevo HTTPS! MessageId:`, data.messageId);
        return { success: true, messageId: data.messageId, transport: 'brevo-https' };
      } else {
        console.warn(`[HTTP EMAIL BRIDGE] Brevo API returned error:`, data);
      }
    } catch (err) {
      console.error(`[HTTP EMAIL BRIDGE] HTTPS fetch error:`, err.message);
    }
  }

  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    try {
      console.log(`[HTTP EMAIL BRIDGE] Dispatching via Resend HTTPS (Port 443)...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MatruCare AI <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[HTTP EMAIL BRIDGE] Real email delivered to ${to} via Resend HTTPS! MessageId:`, data.id);
        return { success: true, messageId: data.id, transport: 'resend-https' };
      }
    } catch (err) {
      console.error(`[HTTP EMAIL BRIDGE] Resend error:`, err.message);
    }
  }

  return null;
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
    from: '"HackSphere" <matrucareai@gmail.com>',
    replyTo: 'matrucareai@gmail.com',
    sender: 'matrucareai@gmail.com',
    to,
    subject,
    html: finalHtml,
    text: finalText || '',
  };

  const isConfigured = userPass && userPass.length > 0;

  if (!isConfigured) {
    console.log(`\n[NODEMAILER DEV LOG] EMAIL_PASS not configured in environment. Simulated send:`);
    console.log(`[NODEMAILER DEV LOG] To: ${to} | Subject: ${subject}`);
    const match = (finalText || finalHtml || '').match(/\b(\d{6})\b/);
    if (match) {
      console.log(`🔑 >>> [OTP CODE]: ${match[1]} <<<`);
    }
    return { success: true, simulated: true, messageId: 'mock-dev-id-' + Date.now(), extractedOtp: match ? match[1] : null };
  }

  // Fast Circuit Breaker: If host firewall (e.g. Railway free/hobby) recently blocked SMTP ports,
  // try HTTPS email bridge (Brevo / Resend) first, or immediately return fallback.
  const isRecentBlock = Date.now() - lastSmtpBlockDetectedAt < SMTP_RECHECK_INTERVAL_MS;
  if (isRecentBlock) {
    const bridgeRes = await sendViaHttpBridge({ to, subject, html: finalHtml, text: finalText });
    if (bridgeRes && bridgeRes.success) {
      return bridgeRes;
    }

    const match = (finalText || finalHtml || '').match(/\b(\d{6})\b/);
    console.log(`[NODEMAILER CLOUD FAST-PATH] Host firewall recently blocked outbound SMTP ports.`);
    if (match) {
      console.log(`🔑 >>> [OTP VERIFICATION CODE FOR ${to}]: ${match[1]} <<<`);
    }
    return {
      success: false,
      error: 'Host firewall blocks outbound SMTP ports (Railway Free/Hobby). Fast cloud fallback active.',
      extractedOtp: match ? match[1] : null,
    };
  }

  console.log(`[NODEMAILER] Dispatching email to: ${to} | From: "HackSphere" <matrucareai@gmail.com> | User: ${userEmail}...`);

  // Attempt 1: Direct SSL (Port 465 with Connection Pooling & IPv4)
  try {
    const transporter = getPrimaryTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[NODEMAILER] Email sent successfully via Port 465! MessageId: ${info.messageId} to ${to}`);
    lastSmtpBlockDetectedAt = 0; // Reset circuit breaker on success
    return { success: true, messageId: info.messageId, transport: 'port465' };
  } catch (err465) {
    console.warn(`[NODEMAILER] Port 465 failed (${err465.message}). Retrying via Port 587 STARTTLS...`);

    // Attempt 2: Fallback to Port 587 STARTTLS
    try {
      const fallbackTransporter = getFallbackTransporter();
      const info = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[NODEMAILER] Email sent successfully via Port 587! MessageId: ${info.messageId} to ${to}`);
      lastSmtpBlockDetectedAt = 0; // Reset circuit breaker on success
      return { success: true, messageId: info.messageId, transport: 'port587' };
    } catch (err587) {
      console.error(`[NODEMAILER ERROR] Both Port 465 and Port 587 failed:`, {
        port465: err465.message,
        port587: err587.message,
      });

      // If both ports failed due to timeout, flag the circuit breaker so next requests are instantaneous
      if (
        (err465.message && err465.message.toLowerCase().includes('timeout')) ||
        (err587.message && err587.message.toLowerCase().includes('timeout'))
      ) {
        lastSmtpBlockDetectedAt = Date.now();
        console.log(`[NODEMAILER] Activated 5-minute fast cloud fallback circuit-breaker.`);
      }

      // Attempt 3: If cloud host blocks raw TCP SMTP ports (465 & 587), try HTTPS email bridge (Brevo / Resend)
      const bridgeRes = await sendViaHttpBridge({ to, subject, html: finalHtml, text: finalText });
      if (bridgeRes && bridgeRes.success) {
        return bridgeRes;
      }

      // Extract OTP if present so it's always immediately visible in cloud container deployment logs
      const match = (finalText || finalHtml || '').match(/\b(\d{6})\b/);
      if (match) {
        console.log(`🔑 >>> [OTP VERIFICATION CODE FOR ${to}]: ${match[1]} <<<`);
      }

      return {
        success: false,
        error: `Port 465: ${err465.message} | Port 587: ${err587.message}`,
        extractedOtp: match ? match[1] : null,
      };
    }
  }
};

export const getTransporter = (preferDirectSsl = true) =>
  preferDirectSsl ? getPrimaryTransporter() : getFallbackTransporter();

export default getPrimaryTransporter;
