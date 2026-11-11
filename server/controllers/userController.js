import User from '../models/User.js';
import Otp from '../models/Otp.js';
import HackathonRegistration from '../models/HackathonRegistration.js';
import { sendMail } from '../config/nodemailer.js';
import { generateStaffOnboardingEmailTemplate } from '../utils/emailTemplates.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/user/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        isActive: user.isActive !== false,
        mobileNumber: user.mobileNumber || '',
        collegeName: user.collegeName || '',
        course: user.course || '',
        branch: user.branch || '',
        yearOfStudy: user.yearOfStudy || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        headline: user.headline || '',
        skills: user.skills || [],
        bio: user.bio || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/user/update
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      collegeName,
      course,
      branch,
      yearOfStudy,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      headline,
      skills,
      bio,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName !== undefined) {
      if (fullName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 3 characters',
        });
      }
      user.fullName = fullName.trim();
    }

    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
    if (collegeName !== undefined) user.collegeName = collegeName.trim();
    if (course !== undefined) user.course = course.trim();
    if (branch !== undefined) user.branch = branch.trim();
    if (yearOfStudy !== undefined) user.yearOfStudy = yearOfStudy.trim();
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (headline !== undefined) user.headline = headline.trim();
    if (bio !== undefined) user.bio = bio.trim();

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        user.skills = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Optional Password Change
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password',
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
      if (newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }
      user.password = newPassword.trim();
    }

    const updatedUser = await user.save();
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        role: updatedUser.role,
        isActive: updatedUser.isActive !== false,
        mobileNumber: updatedUser.mobileNumber || '',
        collegeName: updatedUser.collegeName || '',
        course: updatedUser.course || '',
        branch: updatedUser.branch || '',
        yearOfStudy: updatedUser.yearOfStudy || '',
        githubUrl: updatedUser.githubUrl || '',
        linkedinUrl: updatedUser.linkedinUrl || '',
        portfolioUrl: updatedUser.portfolioUrl || '',
        headline: updatedUser.headline || '',
        skills: updatedUser.skills || [],
        bio: updatedUser.bio || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all registered users (Admin Only)
 * @route   GET /api/user/admin/all
 * @access  Private / Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const [users, registrations] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).lean(),
      HackathonRegistration.find({})
        .select('userId email projectName teamMembers.email')
        .lean(),
    ]);

    const submissionByUserId = new Map();
    const submissionByEmail = new Map();

    for (const reg of registrations) {
      const projectName = reg.projectName || 'Active Team Registration';
      if (reg.userId) {
        submissionByUserId.set(reg.userId.toString(), projectName);
      }
      if (reg.email) {
        submissionByEmail.set(reg.email.trim().toLowerCase(), projectName);
      }
      if (Array.isArray(reg.teamMembers)) {
        for (const member of reg.teamMembers) {
          if (member?.email) {
            submissionByEmail.set(member.email.trim().toLowerCase(), projectName);
          }
        }
      }
    }

    const enrichedUsers = users.map((u) => {
      const normalizedEmail = u.email ? u.email.trim().toLowerCase() : '';
      const linkedProjectName =
        submissionByUserId.get(u._id.toString()) ||
        submissionByEmail.get(normalizedEmail) ||
        null;

      return {
        ...u,
        hasSubmission: Boolean(linkedProjectName),
        linkedProjectName,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('[Get All Users Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a user's role (Admin Only)
 * @route   PATCH /api/user/admin/:id/role
 * @access  Private / Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'volunteer', 'evaluator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`,
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety guard: Prevent changing role of official super admin
    if (
      targetUser.email.toLowerCase() === 'matrucareai@gmail.com' &&
      role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'The official HackSphere super admin role cannot be modified',
      });
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.fullName} role updated to "${role}"`,
      user: {
        _id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.role,
        isVerified: targetUser.isVerified,
      },
    });
  } catch (error) {
    console.error('[Update User Role Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Provision an Event Staff Member (Judge, Volunteer, Co-Admin)
 * @route   POST /api/user/admin/provision-staff
 * @access  Private / Admin
 */
export const provisionStaff = async (req, res) => {
  try {
    const { fullName, email, role, startingPassword, sendEmail = true } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }

    const allowedStaffRoles = ['evaluator', 'volunteer', 'admin'];
    if (!allowedStaffRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff role. Allowed staff roles: evaluator (Judge), volunteer (Gate Staff), admin (Co-Admin)',
      });
    }

    if (!startingPassword || startingPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Starting password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'matrucareai@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'The primary Super Admin account is protected and cannot be modified via staff provisioning',
      });
    }

    let existingUser = await User.findOne({ email: normalizedEmail });

    let provisionedUser;
    if (existingUser) {
      if (!existingUser.role || existingUser.role === 'user') {
        return res.status(400).json({
          success: false,
          message: `Cannot appoint an existing competing candidate email ("${normalizedEmail}") as staff. Staff accounts must use dedicated non-candidate emails.`,
        });
      }

      if (existingUser.role === role && existingUser.isActive !== false) {
        return res.status(400).json({
          success: false,
          message: `Staff member with email "${normalizedEmail}" already exists and is active as "${role}"`,
        });
      }

      // Reactivate or update existing staff account
      existingUser.role = role;
      existingUser.fullName = fullName.trim();
      existingUser.password = startingPassword; // will be hashed by pre-save
      existingUser.isVerified = true;
      existingUser.isActive = true;
      existingUser.provisionedBy = req.user.email || 'Admin';
      existingUser.provisionedAt = new Date();
      provisionedUser = await existingUser.save();
    } else {
      // Create new staff account
      provisionedUser = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        role,
        password: startingPassword, // will be hashed by pre-save
        isVerified: true,
        isActive: true,
        provisionedBy: req.user.email || 'Admin',
        provisionedAt: new Date(),
      });
    }

    // Optionally dispatch welcome onboarding email with starting credentials
    let emailDispatched = false;
    if (sendEmail) {
      try {
        const portalUrl = process.env.CLIENT_URL || 'https://client-seven-gold-99.vercel.app';
        const mailContent = generateStaffOnboardingEmailTemplate({
          fullName: provisionedUser.fullName,
          email: provisionedUser.email,
          role: provisionedUser.role,
          startingPassword,
          portalUrl,
        });

        const mailResult = await sendMail({
          to: provisionedUser.email,
          subject: `Official Staff Authorization — HackSphere 2026 (${role.toUpperCase()})`,
          html: mailContent.html,
          text: mailContent.text,
        });
        emailDispatched = !!mailResult?.success;
      } catch (mailErr) {
        console.error('[Staff Welcome Email Error]:', mailErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Staff member "${provisionedUser.fullName}" provisioned successfully as "${provisionedUser.role}"!`,
      emailDispatched,
      user: {
        _id: provisionedUser._id,
        id: provisionedUser._id,
        fullName: provisionedUser.fullName,
        email: provisionedUser.email,
        role: provisionedUser.role,
        isActive: provisionedUser.isActive !== false,
        isVerified: provisionedUser.isVerified,
        provisionedAt: provisionedUser.provisionedAt,
        provisionedBy: provisionedUser.provisionedBy,
      },
    });
  } catch (error) {
    console.error('[Provision Staff Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to provision staff role' });
  }
};

/**
 * @desc    Toggle Staff Account Active / Deactivated Status
 * @route   PATCH /api/user/admin/:id/toggle-active
 * @access  Private / Admin
 */
export const toggleStaffActive = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Safety guard: Protect Super Admin from deactivation
    if (targetUser.email.toLowerCase() === 'matrucareai@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'The official Super Admin account cannot be deactivated',
      });
    }

    // Safety guard: Admin cannot deactivate their own account
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active admin account',
      });
    }

    targetUser.isActive = targetUser.isActive === false ? true : false;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Account for ${targetUser.fullName} (${targetUser.email}) is now ${targetUser.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
      user: {
        _id: targetUser._id,
        id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    console.error('[Toggle Staff Active Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Deactivate current staff session / role (Self-service)
 * @route   POST /api/user/deactivate-role
 * @access  Private
 */
export const deactivateMyRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email.toLowerCase() === 'matrucareai@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'The primary Super Admin account cannot self-deactivate',
      });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your role access has been deactivated. You will now be signed out.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Restricted removal of unlinked/unverified candidate accounts
 * @route   DELETE /api/user/admin/:id
 * @access  Private/Admin
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const targetEmail = (targetUser.email || '').trim().toLowerCase();
    const operatorEmail = (req.user.email || '').trim().toLowerCase();
    const isOperatorSuperAdmin = operatorEmail === 'matrucareai@gmail.com';

    if (targetEmail === 'matrucareai@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'The primary Super Admin account is permanently protected and cannot be deleted',
      });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active session account',
      });
    }

    if (targetUser.role && targetUser.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Staff role accounts cannot be deleted directly. Use Deactivate Access instead.',
      });
    }

    const escapedEmail = targetEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

    const linkedRegistration = await HackathonRegistration.findOne({
      $or: [
        { userId: targetUser._id },
        { email: emailRegex },
        { 'teamMembers.email': emailRegex },
      ],
    }).select('projectName');

    if (linkedRegistration) {
      return res.status(403).json({
        success: false,
        message: `Locked: "${targetUser.email}" is linked to active team registration "${
          linkedRegistration.projectName || 'Hackathon Submission'
        }". Withdraw or remove that submission first.`,
      });
    }

    if (targetUser.isVerified && !isOperatorSuperAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'OTP-verified candidate accounts are locked against routine removal. Only the Super Admin may execute a restricted purge.',
      });
    }

    const { confirmEmail, confirmationPhrase, reason } = req.body || {};

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Verification failed: typed email does not match the candidate account email.',
      });
    }

    if (!confirmationPhrase || confirmationPhrase.trim() !== 'PERMANENTLY REMOVE') {
      return res.status(400).json({
        success: false,
        message: 'Verification failed: confirmation phrase must exactly match "PERMANENTLY REMOVE".',
      });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Verification failed: provide an audit reason of at least 10 characters.',
      });
    }

    await Otp.deleteMany({ email: targetEmail });
    await User.deleteOne({ _id: targetUser._id });

    console.warn(
      `[AUDIT] ${isOperatorSuperAdmin ? 'Super Admin' : 'Admin'} (${operatorEmail}) permanently removed candidate "${targetUser.fullName}" (${targetEmail}) [verified=${Boolean(
        targetUser.isVerified
      )}]. Reason: ${reason.trim()}`
    );

    return res.status(200).json({
      success: true,
      message: `Candidate account "${targetUser.fullName}" (${targetUser.email}) has been permanently removed.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


