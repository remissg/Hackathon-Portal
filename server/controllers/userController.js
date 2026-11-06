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
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

