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
    return res.status(200).json({ success: true, user });
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
    const { fullName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) {
      if (fullName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 3 characters',
        });
      }
      user.fullName = fullName.trim();
    }

    const updatedUser = await user.save();
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        role: updatedUser.role,
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
        message: 'The official MatruCare AI super admin role cannot be modified',
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


