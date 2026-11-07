import HackathonRegistration from '../models/HackathonRegistration.js';
import { sendMail } from '../config/nodemailer.js';
import { generateRegistrationEmailTemplate } from '../utils/emailTemplates.js';

/**
 * Validate URL helper
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * @desc    Submit Hackathon Registration Form
 * @route   POST /api/hackathon/register
 * @access  Private (JWT Protected)
 */
export const registerHackathon = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has already registered
    const existing = await HackathonRegistration.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a hackathon registration. You can manage or update your entry from the dashboard.',
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      collegeName,
      course,
      branch,
      yearOfStudy,
      domain,
      projectName,
      pptLink,
      prototypeLink,
      demoVideoLink,
      teamSize,
      teamMembers,
    } = req.body;

    // Validation
    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !collegeName ||
      !course ||
      !branch ||
      !yearOfStudy ||
      !domain ||
      !projectName ||
      !pptLink ||
      !prototypeLink
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields',
      });
    }

    // Letters only check for fullName
    if (!/^[a-zA-Z\s.]+$/.test(fullName)) {
      return res.status(400).json({
        success: false,
        message: 'Full Name should contain letters and spaces only',
      });
    }

    // Indian 10-digit mobile number validation
    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number',
      });
    }

    // Project Name min 5 chars
    if (projectName.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 5 characters long',
      });
    }

    // URL validations
    if (!isValidUrl(pptLink)) {
      return res.status(400).json({
        success: false,
        message: 'Presentation (PPT) link must be a valid URL',
      });
    }

    if (!isValidUrl(prototypeLink)) {
      return res.status(400).json({
        success: false,
        message: 'Prototype / Repository link must be a valid URL',
      });
    }

    if (demoVideoLink && !isValidUrl(demoVideoLink)) {
      return res.status(400).json({
        success: false,
        message: 'Demo Video link must be a valid URL',
      });
    }

    const parsedTeamSize = parseInt(teamSize, 10) || 1;
    let cleanTeamMembers = [];

    if (parsedTeamSize > 1) {
      if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Please provide details for the ${parsedTeamSize - 1} additional team member(s)`,
        });
      }

      // Check each member
      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name || !m.name.trim() || !m.email || !m.email.trim()) {
          return res.status(400).json({
            success: false,
            message: `Please fill name and email for Member #${i + 2}`,
          });
        }
        if (!/^\S+@\S+\.\S+$/.test(m.email.trim())) {
          return res.status(400).json({
            success: false,
            message: `Invalid email address for Member #${i + 2}`,
          });
        }
        cleanTeamMembers.push({
          name: m.name.trim(),
          email: m.email.trim().toLowerCase(),
        });
      }
    }

    // Create entry in MongoDB
    const registration = await HackathonRegistration.create({
      userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      collegeName: collegeName.trim(),
      course,
      branch,
      yearOfStudy,
      domain,
      projectName: projectName.trim(),
      pptLink: pptLink.trim(),
      prototypeLink: prototypeLink.trim(),
      demoVideoLink: demoVideoLink ? demoVideoLink.trim() : '',
      teamSize: parsedTeamSize,
      teamMembers: cleanTeamMembers,
      status: 'Submitted',
    });

    // Send confirmation email via Nodemailer
    const emailHtml = generateRegistrationEmailTemplate({
      participantName: registration.fullName,
      eventName: 'MatruCare AI National Innovation Hackathon 2026',
      domain: registration.domain,
      projectName: registration.projectName,
      teamSize: registration.teamSize,
      teamMembers: registration.teamMembers,
      pptLink: registration.pptLink,
      prototypeLink: registration.prototypeLink,
      demoVideoLink: registration.demoVideoLink,
    });

    await sendMail({
      to: registration.email,
      subject: `Registration Confirmed: ${registration.projectName} — MatruCare AI Hackathon`,
      html: emailHtml,
    });

    return res.status(201).json({
      success: true,
      message: 'Hackathon registration submitted successfully! A confirmation email has been sent.',
      registration,
    });
  } catch (error) {
    console.error('[Hackathon Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during hackathon registration',
    });
  }
};

/**
 * @desc    Get logged in user's hackathon registration
 * @route   GET /api/hackathon/my-entry
 * @access  Private (JWT Protected)
 */
export const getMyEntry = async (req, res) => {
  try {
    const entry = await HackathonRegistration.findOne({ userId: req.user._id });
    return res.status(200).json({
      success: true,
      entry: entry || null,
    });
  } catch (error) {
    console.error('[Get My Entry Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch registration entry',
    });
  }
};

/**
 * @desc    Update hackathon registration
 * @route   PUT /api/hackathon/:id
 * @access  Private (JWT Protected)
 */
export const updateEntry = async (req, res) => {
  try {
    const entry = await HackathonRegistration.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Registration entry not found',
      });
    }

    // Verify ownership
    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this entry',
      });
    }

    const {
      mobileNumber,
      collegeName,
      course,
      branch,
      yearOfStudy,
      domain,
      projectName,
      pptLink,
      prototypeLink,
      demoVideoLink,
      teamSize,
      teamMembers,
    } = req.body;

    if (mobileNumber) entry.mobileNumber = mobileNumber.trim();
    if (collegeName) entry.collegeName = collegeName.trim();
    if (course) entry.course = course;
    if (branch) entry.branch = branch;
    if (yearOfStudy) entry.yearOfStudy = yearOfStudy;
    if (domain) entry.domain = domain;
    if (projectName) entry.projectName = projectName.trim();
    if (pptLink) entry.pptLink = pptLink.trim();
    if (prototypeLink) entry.prototypeLink = prototypeLink.trim();
    if (demoVideoLink !== undefined) entry.demoVideoLink = demoVideoLink ? demoVideoLink.trim() : '';

    if (teamSize !== undefined) {
      const parsedSize = parseInt(teamSize, 10) || 1;
      entry.teamSize = parsedSize;
      if (parsedSize > 1 && Array.isArray(teamMembers)) {
        entry.teamMembers = teamMembers.map((m) => ({
          name: m.name ? m.name.trim() : '',
          email: m.email ? m.email.trim().toLowerCase() : '',
        }));
      } else {
        entry.teamMembers = [];
      }
    }

    const updatedEntry = await entry.save();

    return res.status(200).json({
      success: true,
      message: 'Registration entry updated successfully',
      entry: updatedEntry,
    });
  } catch (error) {
    console.error('[Update Entry Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update entry',
    });
  }
};

/**
 * @desc    Delete/Withdraw hackathon registration
 * @route   DELETE /api/hackathon/:id
 * @access  Private (JWT Protected / Admin)
 */
export const deleteEntry = async (req, res) => {
  try {
    const entry = await HackathonRegistration.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Registration entry not found',
      });
    }

    // Verify ownership or admin privileges
    const isAdmin =
      req.user.role === 'admin' ||
      req.user.email?.toLowerCase() === 'matrucareai@gmail.com';

    if (entry.userId.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this entry',
      });
    }

    await HackathonRegistration.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Hackathon registration entry successfully removed',
    });
  } catch (error) {
    console.error('[Delete Entry Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete entry',
    });
  }
};

/**
 * @desc    Get all hackathon registrations (Admin Only)
 * @route   GET /api/hackathon/admin/all
 * @access  Private / Admin
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const { search, domain, status } = req.query;
    let query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { projectName: searchRegex },
        { collegeName: searchRegex },
        { email: searchRegex },
      ];
    }

    if (domain && domain !== 'All') {
      query.domain = domain;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const registrations = await HackathonRegistration.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('[Admin Get All Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch registrations',
    });
  }
};

/**
 * @desc    Get Admin Dashboard Analytics / Stats
 * @route   GET /api/hackathon/admin/stats
 * @access  Private / Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    const all = await HackathonRegistration.find();

    const totalRegistrations = all.length;
    let totalParticipants = 0;
    let soloCount = 0;
    let teamCount = 0;

    const domainCounts = {};
    const statusCounts = {
      Submitted: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Finalist: 0,
      Rejected: 0,
    };

    all.forEach((entry) => {
      const size = entry.teamSize || 1;
      totalParticipants += size;
      if (size === 1) {
        soloCount++;
      } else {
        teamCount++;
      }

      // Domain stats
      const d = entry.domain || 'Unspecified';
      domainCounts[d] = (domainCounts[d] || 0) + 1;

      // Status stats
      const s = entry.status || 'Submitted';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        totalParticipants,
        soloCount,
        teamCount,
        domainCounts,
        statusCounts,
      },
    });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics',
    });
  }
};

/**
 * @desc    Update candidate registration status (Admin Only)
 * @route   PATCH /api/hackathon/admin/:id/status
 * @access  Private / Admin
 */
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Submitted', 'Under Review', 'Shortlisted', 'Finalist', 'Rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const entry = await HackathonRegistration.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Registration entry not found',
      });
    }

    entry.status = status;
    const updated = await entry.save();

    return res.status(200).json({
      success: true,
      message: `Project status updated to "${status}"`,
      entry: updated,
    });
  } catch (error) {
    console.error('[Admin Update Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update status',
    });
  }
};

