import { sendMail } from '../config/nodemailer.js';
import ContactMessage from '../models/ContactMessage.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * @desc    Submit Contact Query
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message',
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Persist inquiry in MongoDB first
    const contactRecord = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    await recordAuditLog({
      req,
      category: 'contact',
      action: 'CONTACT_QUERY_SUBMITTED',
      severity: 'info',
      target: { type: 'contact', id: contactRecord._id, label: name },
      summary: `Received public contact inquiry from ${name} (${email})`,
    });

    // Try sending notification emails
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0b132b;">New Contact Inquiry — HackSphere Hackathon 2026</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; border-radius: 4px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `;

      await sendMail({
        to: process.env.EMAIL_USER || 'matrucareai@gmail.com',
        subject: `Hackathon Inquiry from ${name} (${email})`,
        html: htmlContent,
        text: `Inquiry from ${name} (${email}):\n\n${message}`,
      });

      // Send automated acknowledgement email to the sender
      const ackHtml = `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #0b132b; margin-top: 0;">HackSphere — Inquiry Received</h2>
          <p>Dear ${name},</p>
          <p>Thank you for reaching out to the <strong>HackSphere National Innovation Hackathon 2026</strong> organizing committee.</p>
          <p>We have successfully received your inquiry regarding:</p>
          <blockquote style="background-color: #ffffff; border-left: 4px solid #0284c7; padding: 12px; margin: 16px 0; color: #475569;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
          <p>Our academic and technical coordination team will review your query and reply within 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            <strong>HackSphere • National Innovation Arena</strong><br />
            Contact: <a href="mailto:matrucareai@gmail.com" style="color: #0284c7;">matrucareai@gmail.com</a>
          </p>
        </div>
      `;

      await sendMail({
        to: email.trim().toLowerCase(),
        subject: 'We Received Your Inquiry — HackSphere Hackathon 2026',
        html: ackHtml,
        text: `Dear ${name},\n\nWe have received your inquiry. Our team will review it and reply within 24 hours.\n\nHackSphere`,
      });
    } catch (mailErr) {
      console.warn('[Contact Controller] Note: Mail dispatch error (logged in DB):', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been received. A confirmation has been sent to your email and the HackSphere team will get back to you shortly.',
      inquiryId: contactRecord._id,
    });
  } catch (error) {
    console.error('[Contact Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact message',
    });
  }
};

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/contact
 * @access  Private / Admin
 */
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('[Get Contact Messages Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages',
    });
  }
};

