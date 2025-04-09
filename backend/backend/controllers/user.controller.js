import User from '../models/user.model.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    console.log('getUserProfile called');
    
    // User is already attached to req by the verifyToken middleware
    const userId = req.user?._id;
    
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('Finding user with ID:', userId);
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found:', user.username);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      studentId,
      department,
      batch,
      university,
      type,
      phone,
      img
    } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;
    if (batch !== undefined) user.batch = batch;
    if (university !== undefined) user.university = university;
    if (type !== undefined && ['customer', 'seller'].includes(type)) user.type = type;
    if (phone !== undefined) user.phone = phone;
    if (img !== undefined) user.img = img;
    
    // Save updated user
    const updatedUser = await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
        batch: updatedUser.batch,
        university: updatedUser.university,
        type: updatedUser.type,
        phone: updatedUser.phone,
        img: updatedUser.img
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
}; 