import { sendMail } from '../config/nodemailer.js';

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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0b132b;">New Contact Inquiry — MatruCare AI Hackathon</h2>
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

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been received. The MatruCare AI team will get back to you shortly.',
    });
  } catch (error) {
    console.error('[Contact Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact message',
    });
  }
};
