import HackathonRegistration from '../models/HackathonRegistration.js';
import User from '../models/User.js';
import { sendMail } from '../config/nodemailer.js';
import {
  generateRegistrationEmailTemplate,
  generateTeammateInviteEmailTemplate,
  generateStatusUpdateEmailTemplate,
} from '../utils/emailTemplates.js';

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
          collegeName: m.collegeName ? m.collegeName.trim() : collegeName.trim(),
          status: 'Pending',
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
      hackathonId: req.body.hackathonId || null,
      problemStatementId: req.body.problemStatementId || '',
      problemStatementTitle: req.body.problemStatementTitle || '',
      projectName: projectName.trim(),
      pptLink: pptLink.trim(),
      prototypeLink: prototypeLink.trim(),
      demoVideoLink: demoVideoLink ? demoVideoLink.trim() : '',
      teamSize: parsedTeamSize,
      teamMembers: cleanTeamMembers,
      status: 'Submitted',
    });

    // Send confirmation email via Nodemailer
    const regEmail = generateRegistrationEmailTemplate({
      participantName: registration.fullName,
      eventName: 'HackSphere National Innovation Hackathon 2026',
      domain: registration.domain,
      projectName: registration.projectName,
      teamSize: registration.teamSize,
      teamMembers: registration.teamMembers,
      pptLink: registration.pptLink,
      prototypeLink: registration.prototypeLink,
      demoVideoLink: registration.demoVideoLink,
    });

    const leadMailRes = await sendMail({
      to: registration.email,
      subject: `Registration Confirmed: ${registration.projectName} — HackSphere Hackathon`,
      html: regEmail.html,
      text: regEmail.text,
    });
    console.log(`[Registration] Lead email dispatched to ${registration.email}:`, leadMailRes);

    // Send teammate invitation emails if additional members are present (properly awaited)
    if (Array.isArray(cleanTeamMembers) && cleanTeamMembers.length > 0) {
      const ticketId = `MCAI-2026-${registration._id.toString().slice(-4).toUpperCase()}`;
      const invitePromises = cleanTeamMembers
        .filter((member) => member && member.email)
        .map(async (member) => {
          try {
            const inviteEmail = generateTeammateInviteEmailTemplate({
              memberName: member.name,
              memberEmail: member.email,
              teamLeadName: registration.fullName,
              teamLeadEmail: registration.email,
              domain: registration.domain,
              projectName: registration.projectName,
              ticketId,
            });

            const inviteRes = await sendMail({
              to: member.email,
              subject: `You've been added to Team "${registration.projectName}" — HackSphere Hackathon 2026`,
              html: inviteEmail.html,
              text: inviteEmail.text,
            });
            console.log(`[Teammate Invite] Email dispatched to ${member.email}:`, inviteRes);
            return inviteRes;
          } catch (err) {
            console.error(`[Teammate Notification Email Error to ${member.email}]:`, err.message);
            return { success: false, error: err.message };
          }
        });

      await Promise.allSettled(invitePromises);
    }

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
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    // Match if user is the Team Lead OR listed as a dynamic Team Member
    const entry = await HackathonRegistration.findOne({
      $or: [
        { userId: req.user._id },
        { email: userEmail },
        { 'teamMembers.email': userEmail },
      ],
    });

    let entryObj = entry ? (entry.toObject ? entry.toObject() : entry) : null;
    if (entryObj && Array.isArray(entryObj.teamMembers) && entryObj.teamMembers.length > 0) {
      const memberEmails = entryObj.teamMembers.map((m) => m.email.toLowerCase());
      const users = await User.find({ email: { $in: memberEmails } }).select('email collegeName');
      const collegeMap = {};
      users.forEach((u) => {
        if (u.collegeName) collegeMap[u.email.toLowerCase()] = u.collegeName;
      });

      entryObj.teamMembers = entryObj.teamMembers.map((m) => ({
        ...m,
        collegeName: m.collegeName || collegeMap[m.email.toLowerCase()] || entryObj.collegeName || '',
      }));
    }

    const isTeamLead = entryObj ? entryObj.userId.toString() === req.user._id.toString() : false;
    let memberStatus = isTeamLead ? 'Accepted' : null;
    if (entryObj && !isTeamLead && Array.isArray(entryObj.teamMembers)) {
      const myMember = entryObj.teamMembers.find((m) => m.email.toLowerCase() === userEmail);
      if (myMember) {
        memberStatus = myMember.status || 'Pending';
      }
    }

    return res.status(200).json({
      success: true,
      entry: entryObj || null,
      isTeamLead,
      memberStatus,
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
        entry.teamMembers = teamMembers.map((m) => {
          const existing = (entry.teamMembers || []).find(
            (em) => em.email?.toLowerCase() === (m.email || '').toLowerCase().trim()
          );
          return {
            name: m.name ? m.name.trim() : '',
            email: m.email ? m.email.trim().toLowerCase() : '',
            collegeName: m.collegeName ? m.collegeName.trim() : (existing?.collegeName || entry.collegeName || ''),
            status: existing?.status || 'Pending',
            acceptedAt: existing?.acceptedAt || null,
            isCheckedIn: existing?.isCheckedIn || false,
            checkedInAt: existing?.checkedInAt || null,
            checkedInBy: existing?.checkedInBy || null,
          };
        });
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

    const oldStatus = entry.status;
    entry.status = status;
    const updated = await entry.save();

    // If status changed, send milestone email notifications to team lead & accepted teammates
    if (oldStatus !== status) {
      const ticketId = entry.ticketId || `MCAI-2026-${entry._id.toString().slice(-4).toUpperCase()}`;
      const recipients = [];

      // Add team lead
      recipients.push({ name: entry.fullName, email: entry.email });

      // Add accepted teammates
      if (Array.isArray(entry.teamMembers)) {
        entry.teamMembers.forEach((m) => {
          if (m.email && m.status === 'Accepted') {
            recipients.push({ name: m.name, email: m.email });
          }
        });
      }

      // Dispatch in parallel
      const emailDispatches = recipients.map((r) => {
        const milestoneEmail = generateStatusUpdateEmailTemplate({
          participantName: r.name,
          projectName: entry.projectName,
          status,
          domain: entry.domain,
          ticketId,
        });

        return sendMail({
          to: r.email,
          subject: `Status Milestone: ${entry.projectName} is now "${status.toUpperCase()}" — HackSphere Hackathon`,
          html: milestoneEmail.html,
          text: milestoneEmail.text,
        });
      });

      Promise.allSettled(emailDispatches).catch((err) =>
        console.error('[Milestone Email Dispatch Error]:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Project status updated to "${status}" and milestone notifications dispatched.`,
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

/**
 * @desc    Verify Official Admission Pass by Ticket ID (Public / Scanner)
 * @route   GET /api/hackathon/verify-pass/:passId
 * @access  Public
 */
export const verifyPass = async (req, res) => {
  try {
    const rawPassId = (req.params.passId || '').trim();
    const targetedMemberQuery = (req.query.member || req.query.memberEmail || '').trim().toLowerCase();

    if (!rawPassId) {
      return res.status(400).json({ success: false, verified: false, message: 'Pass ID is required' });
    }

    // Try finding by ticketId or by suffix of _id
    let entry = await HackathonRegistration.findOne({
      $or: [
        { ticketId: rawPassId },
        { ticketId: new RegExp(`^${rawPassId}$`, 'i') },
      ],
    });

    if (!entry) {
      const allEntries = await HackathonRegistration.find();
      entry = allEntries.find((e) => {
        const genTicket = `MCAI-2026-${e._id.toString().slice(-4).toUpperCase()}`;
        return (
          genTicket.toLowerCase() === rawPassId.toLowerCase() ||
          e._id.toString().toUpperCase().endsWith(rawPassId.toUpperCase().replace(/^MCAI-2026-/, ''))
        );
      });
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid or unregistered Hackathon Pass ID',
      });
    }

    const ticketId = entry.ticketId || `MCAI-2026-${entry._id.toString().slice(-4).toUpperCase()}`;

    // Team Leader Check-in Status
    const leaderIsCheckedIn = entry.leaderIsCheckedIn ?? Boolean(entry.isCheckedIn);
    const leaderCheckedInAt = entry.leaderCheckedInAt || entry.checkedInAt;
    const leaderCheckedInBy = entry.leaderCheckedInBy || entry.checkedInBy;

    // Fetch teammate profile colleges if not present
    const memberEmails = (entry.teamMembers || []).map((m) => m.email.toLowerCase());
    const users = await User.find({ email: { $in: memberEmails } }).select('email collegeName');
    const collegeMap = {};
    users.forEach((u) => {
      if (u.collegeName) collegeMap[u.email.toLowerCase()] = u.collegeName;
    });

    // Teammates Check-in Statuses
    const teamMembers = (entry.teamMembers || []).map((m) => ({
      name: m.name,
      email: m.email,
      collegeName: m.collegeName || collegeMap[m.email.toLowerCase()] || entry.collegeName || 'Verified Institute',
      status: m.status || 'Pending',
      acceptedAt: m.acceptedAt,
      isCheckedIn: Boolean(m.isCheckedIn),
      checkedInAt: m.checkedInAt,
      checkedInBy: m.checkedInBy,
    }));

    // Find targeted member if late arrival scanned a personal pass
    let targetedMember = null;
    if (targetedMemberQuery) {
      if (entry.email.toLowerCase() === targetedMemberQuery) {
        targetedMember = {
          name: entry.fullName,
          email: entry.email,
          isLeader: true,
          isCheckedIn: leaderIsCheckedIn,
          checkedInAt: leaderCheckedInAt,
        };
      } else {
        const found = teamMembers.find((m) => m.email.toLowerCase() === targetedMemberQuery);
        if (found) {
          targetedMember = {
            ...found,
            isLeader: false,
          };
        }
      }
    }

    // Attendance stats
    const totalMembers = 1 + teamMembers.length;
    const admittedMembers = (leaderIsCheckedIn ? 1 : 0) + teamMembers.filter((m) => m.isCheckedIn).length;

    return res.status(200).json({
      success: true,
      verified: true,
      pass: {
        ticketId,
        projectName: entry.projectName,
        domain: entry.domain,
        collegeName: entry.collegeName,
        course: entry.course,
        branch: entry.branch,
        yearOfStudy: entry.yearOfStudy,
        teamLeadName: entry.fullName,
        teamLeadEmail: entry.email,
        leaderIsCheckedIn,
        leaderCheckedInAt,
        leaderCheckedInBy,
        teamSize: entry.teamSize,
        teamMembers,
        status: entry.status,
        isCheckedIn: Boolean(entry.isCheckedIn || leaderIsCheckedIn || admittedMembers > 0),
        checkedInAt: entry.checkedInAt || leaderCheckedInAt,
        checkedInBy: entry.checkedInBy || leaderCheckedInBy,
        totalMembers,
        admittedMembers,
        targetedMember,
        submittedAt: entry.createdAt,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Verify Pass Error]:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: error.message || 'Pass verification failed',
    });
  }
};

/**
 * @desc    Toggle check-in / admit candidate team or individual members (Admin & Volunteers)
 * @route   POST /api/hackathon/admin/check-in
 * @access  Private / Admin / Volunteer
 */
export const checkInPass = async (req, res) => {
  try {
    const { passId, action, memberEmail } = req.body;
    if (!passId) {
      return res.status(400).json({ success: false, message: 'Pass ID is required' });
    }

    const rawPassId = passId.trim();
    const operator = req.user?.email || 'admin';
    const now = new Date();

    // Find registration
    let entry = await HackathonRegistration.findOne({
      $or: [
        { ticketId: rawPassId },
        { ticketId: new RegExp(`^${rawPassId}$`, 'i') },
      ],
    });

    if (!entry) {
      const allEntries = await HackathonRegistration.find();
      entry = allEntries.find((e) => {
        const genTicket = `MCAI-2026-${e._id.toString().slice(-4).toUpperCase()}`;
        return (
          genTicket.toLowerCase() === rawPassId.toLowerCase() ||
          e._id.toString().toUpperCase().endsWith(rawPassId.toUpperCase().replace(/^MCAI-2026-/, ''))
        );
      });
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No hackathon registration found for this Pass ID',
      });
    }

    let responseMsg = '';

    if (action === 'admit-all' || action === 'check-in') {
      // Check in Leader
      entry.leaderIsCheckedIn = true;
      entry.leaderCheckedInAt = now;
      entry.leaderCheckedInBy = operator;

      // Check in all team members
      if (Array.isArray(entry.teamMembers)) {
        entry.teamMembers.forEach((m) => {
          m.isCheckedIn = true;
          m.checkedInAt = now;
          m.checkedInBy = operator;
        });
      }

      entry.isCheckedIn = true;
      entry.checkedInAt = now;
      entry.checkedInBy = operator;
      responseMsg = `Entire Team "${entry.projectName}" (${1 + (entry.teamMembers?.length || 0)} members) admitted to venue!`;
    } else if (action === 'undo-all' || action === 'undo') {
      // Revoke Leader
      entry.leaderIsCheckedIn = false;
      entry.leaderCheckedInAt = null;
      entry.leaderCheckedInBy = null;

      // Revoke all team members
      if (Array.isArray(entry.teamMembers)) {
        entry.teamMembers.forEach((m) => {
          m.isCheckedIn = false;
          m.checkedInAt = null;
          m.checkedInBy = null;
        });
      }

      entry.isCheckedIn = false;
      entry.checkedInAt = null;
      entry.checkedInBy = null;
      responseMsg = `Check-in reversed for Team "${entry.projectName}". All members reset to pending.`;
    } else if (action === 'toggle-leader') {
      const nextState = !entry.leaderIsCheckedIn;
      entry.leaderIsCheckedIn = nextState;
      entry.leaderCheckedInAt = nextState ? now : null;
      entry.leaderCheckedInBy = nextState ? operator : null;
      responseMsg = nextState
        ? `Team Leader (${entry.fullName}) checked in successfully.`
        : `Team Leader (${entry.fullName}) check-in reversed.`;
    } else if (action === 'toggle-member' || action === 'admit-member') {
      const targetEmail = (memberEmail || '').trim().toLowerCase();
      if (!targetEmail) {
        return res.status(400).json({ success: false, message: 'Member email is required for member check-in' });
      }

      if (entry.email.toLowerCase() === targetEmail) {
        const nextState = action === 'admit-member' ? true : !entry.leaderIsCheckedIn;
        entry.leaderIsCheckedIn = nextState;
        entry.leaderCheckedInAt = nextState ? now : null;
        entry.leaderCheckedInBy = nextState ? operator : null;
        responseMsg = nextState
          ? `Team Leader (${entry.fullName}) admitted to venue!`
          : `Team Leader (${entry.fullName}) check-in reversed.`;
      } else {
        const member = (entry.teamMembers || []).find((m) => m.email.toLowerCase() === targetEmail);
        if (!member) {
          return res.status(404).json({ success: false, message: `Member "${targetEmail}" not found on team roster.` });
        }

        const nextState = action === 'admit-member' ? true : !member.isCheckedIn;
        member.isCheckedIn = nextState;
        member.checkedInAt = nextState ? now : null;
        member.checkedInBy = nextState ? operator : null;
        responseMsg = nextState
          ? `Teammate "${member.name}" admitted to venue!`
          : `Teammate "${member.name}" check-in reversed.`;
      }
    }

    // Recalculate team-level summary
    const anyAdmitted = entry.leaderIsCheckedIn || (entry.teamMembers || []).some((m) => m.isCheckedIn);
    entry.isCheckedIn = anyAdmitted;
    if (anyAdmitted && !entry.checkedInAt) {
      entry.checkedInAt = now;
      entry.checkedInBy = operator;
    } else if (!anyAdmitted) {
      entry.checkedInAt = null;
      entry.checkedInBy = null;
    }

    await entry.save();

    const totalMembers = 1 + (entry.teamMembers?.length || 0);
    const admittedMembers = (entry.leaderIsCheckedIn ? 1 : 0) + (entry.teamMembers?.filter((m) => m.isCheckedIn).length || 0);

    return res.status(200).json({
      success: true,
      message: responseMsg,
      entry,
      isCheckedIn: entry.isCheckedIn,
      checkedInAt: entry.checkedInAt,
      checkedInBy: entry.checkedInBy,
      totalMembers,
      admittedMembers,
    });
  } catch (error) {
    console.error('[Admin Check-In Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update check-in status',
    });
  }
};

/**
 * @desc    Get Invitation Details by Pass ID / Ticket ID
 * @route   GET /api/hackathon/invite/:passId
 * @access  Public
 */
export const getInvitationDetails = async (req, res) => {
  try {
    const rawPassId = (req.params.passId || '').trim();
    if (!rawPassId) {
      return res.status(400).json({ success: false, message: 'Pass ID is required' });
    }

    // Try finding by ticketId or by suffix of _id
    let entry = await HackathonRegistration.findOne({
      $or: [
        { ticketId: rawPassId },
        { ticketId: new RegExp(`^${rawPassId}$`, 'i') },
      ],
    });

    if (!entry) {
      const allEntries = await HackathonRegistration.find();
      entry = allEntries.find((e) => {
        const genTicket = `MCAI-2026-${e._id.toString().slice(-4).toUpperCase()}`;
        return (
          genTicket.toLowerCase() === rawPassId.toLowerCase() ||
          e._id.toString().toUpperCase().endsWith(rawPassId.toUpperCase().replace(/^MCAI-2026-/, ''))
        );
      });
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No hackathon team found matching this Pass ID',
      });
    }

    const ticketId = entry.ticketId || `MCAI-2026-${entry._id.toString().slice(-4).toUpperCase()}`;

    return res.status(200).json({
      success: true,
      invite: {
        ticketId,
        projectName: entry.projectName,
        domain: entry.domain,
        teamLeadName: entry.fullName,
        teamLeadEmail: entry.email,
        collegeName: entry.collegeName,
        teamSize: entry.teamSize,
        teamMembers: (entry.teamMembers || []).map((m) => ({
          name: m.name,
          email: m.email,
          status: m.status || 'Pending',
        })),
        status: entry.status,
      },
    });
  } catch (error) {
    console.error('[Get Invitation Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch invitation details',
    });
  }
};

/**
 * @desc    Accept or Decline Team Invitation
 * @route   POST /api/hackathon/respond-invite
 * @access  Private (JWT Protected)
 */
export const respondToInvitation = async (req, res) => {
  try {
    const { passId, action } = req.body;
    const userEmail = (req.user.email || '').trim().toLowerCase();

    if (!passId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Pass ID and response action (accept or decline) are required',
      });
    }

    // Find registration
    let entry = await HackathonRegistration.findOne({
      $or: [
        { ticketId: passId },
        { ticketId: new RegExp(`^${passId}$`, 'i') },
        { 'teamMembers.email': userEmail },
      ],
    });

    if (!entry) {
      const all = await HackathonRegistration.find({ 'teamMembers.email': userEmail });
      entry = all[0];
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No hackathon registration found for your account under this team',
      });
    }

    // Check if user is in teamMembers
    const memberIndex = entry.teamMembers.findIndex(
      (m) => m.email.toLowerCase() === userEmail
    );

    if (memberIndex === -1) {
      return res.status(403).json({
        success: false,
        message: `Your logged-in email (${userEmail}) is not listed on this team's roster.`,
      });
    }

    const newStatus = action.toLowerCase() === 'decline' ? 'Declined' : 'Accepted';
    entry.teamMembers[memberIndex].status = newStatus;
    if (newStatus === 'Accepted') {
      entry.teamMembers[memberIndex].acceptedAt = new Date();
      if (req.user.collegeName && req.user.collegeName.trim()) {
        entry.teamMembers[memberIndex].collegeName = req.user.collegeName.trim();
      }
    }

    await entry.save();

    return res.status(200).json({
      success: true,
      message:
        newStatus === 'Accepted'
          ? `Congratulations! You have officially accepted the invitation and joined Team "${entry.projectName}".`
          : `You have declined the invitation to join Team "${entry.projectName}".`,
      registration: entry,
      memberStatus: newStatus,
    });
  } catch (error) {
    console.error('[Respond Invitation Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update invitation status',
    });
  }
};

/**
 * @desc    Submit or update evaluation score for a hackathon registration (Evaluator / Admin)
 * @route   POST /api/hackathon/:id/evaluate
 * @access  Private / Evaluator or Admin
 */
export const submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      innovation = 5,
      technicalExecution = 5,
      healthcareImpact = 5,
      presentation = 5,
      recommendation = 'Consideration',
      feedback = '',
    } = req.body;

    const parseScore = (val) => {
      const num = Number(val);
      if (isNaN(num)) return 5;
      return Math.min(Math.max(Math.round(num), 1), 10);
    };

    const cleanInnovation = parseScore(innovation);
    const cleanTechnical = parseScore(technicalExecution);
    const cleanImpact = parseScore(healthcareImpact);
    const cleanPresentation = parseScore(presentation);
    const totalScore = cleanInnovation + cleanTechnical + cleanImpact + cleanPresentation; // max 40

    const entry = await HackathonRegistration.findById(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Hackathon registration not found' });
    }

    if (!Array.isArray(entry.evaluations)) {
      entry.evaluations = [];
    }

    const existingIndex = entry.evaluations.findIndex(
      (ev) => ev.evaluatorId?.toString() === req.user._id.toString()
    );

    const evaluationPayload = {
      evaluatorId: req.user._id,
      evaluatorName: req.user.fullName || 'Judge',
      evaluatorEmail: req.user.email,
      innovation: cleanInnovation,
      technicalExecution: cleanTechnical,
      healthcareImpact: cleanImpact,
      presentation: cleanPresentation,
      totalScore,
      recommendation,
      feedback: (feedback || '').trim(),
      evaluatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      entry.evaluations[existingIndex] = evaluationPayload;
    } else {
      entry.evaluations.push(evaluationPayload);
    }

    // Recalculate averageScore
    const sum = entry.evaluations.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
    entry.averageScore = Number((sum / entry.evaluations.length).toFixed(1));
    entry.evaluationCount = entry.evaluations.length;

    await entry.save();

    return res.status(200).json({
      success: true,
      message: `Evaluation submitted successfully for "${entry.projectName}"! Total Score: ${totalScore}/40`,
      averageScore: entry.averageScore,
      evaluationCount: entry.evaluationCount,
      evaluation: evaluationPayload,
      entry,
    });
  } catch (error) {
    console.error('[Submit Evaluation Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit evaluation',
    });
  }
};

/**
 * @desc    Get all submissions with evaluation data for Judges/Evaluators
 * @route   GET /api/hackathon/evaluator/submissions
 * @access  Private / Evaluator or Admin
 */
export const getEvaluatorSubmissions = async (req, res) => {
  try {
    const submissions = await HackathonRegistration.find({})
      .select('-mobileNumber') // Protect candidate personal mobile number from judges
      .sort({ createdAt: -1 });

    const formatted = submissions.map((entry) => {
      const obj = entry.toObject();
      const myReview = obj.evaluations?.find(
        (ev) => ev.evaluatorId?.toString() === req.user._id.toString()
      );
      return {
        ...obj,
        myReview: myReview || null,
        hasEvaluated: Boolean(myReview),
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      submissions: formatted,
    });
  } catch (error) {
    console.error('[Get Evaluator Submissions Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch submissions for evaluator',
    });
  }
};

/**
 * @desc    Public Leaderboard & Project Showcase
 * @route   GET /api/hackathon/leaderboard
 * @access  Public
 */
export const getPublicLeaderboard = async (req, res) => {
  try {
    const { domain, search, sort = 'score' } = req.query;

    const query = {};

    if (domain && domain !== 'All') {
      query.domain = domain;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { projectName: regex },
        { collegeName: regex },
        { fullName: regex },
        { domain: regex },
      ];
    }

    // Determine sorting criteria
    let sortObj = { averageScore: -1, evaluationCount: -1, createdAt: -1 };
    if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'alpha') {
      sortObj = { projectName: 1 };
    }

    const registrations = await HackathonRegistration.find(query)
      .select(
        'projectName domain collegeName course branch yearOfStudy teamSize fullName teamMembers pptLink prototypeLink demoVideoLink status averageScore evaluationCount ticketId createdAt'
      )
      .sort(sortObj)
      .lean();

    // Map rank to each entry
    const leaderboard = registrations.map((entry, index) => {
      return {
        rank: index + 1,
        id: entry._id,
        ticketId: entry.ticketId,
        projectName: entry.projectName,
        domain: entry.domain,
        collegeName: entry.collegeName,
        course: entry.course,
        branch: entry.branch,
        yearOfStudy: entry.yearOfStudy,
        teamSize: entry.teamSize,
        teamLead: entry.fullName,
        teamMembers: (entry.teamMembers || []).map((m) => m.name),
        status: entry.status,
        averageScore: entry.averageScore || 0,
        evaluationCount: entry.evaluationCount || 0,
        pptLink: entry.pptLink,
        prototypeLink: entry.prototypeLink,
        demoVideoLink: entry.demoVideoLink,
        createdAt: entry.createdAt,
      };
    });

    const totalProjects = registrations.length;
    const evaluatedProjects = registrations.filter((r) => (r.evaluationCount || 0) > 0).length;
    const topScore = registrations.length > 0 ? registrations[0].averageScore || 0 : 0;

    return res.status(200).json({
      success: true,
      count: leaderboard.length,
      stats: {
        totalProjects,
        evaluatedProjects,
        topScore,
      },
      leaderboard,
    });
  } catch (error) {
    console.error('[Public Leaderboard Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch public leaderboard',
    });
  }
};


