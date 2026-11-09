import User from '../models/User.js';

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
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
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


