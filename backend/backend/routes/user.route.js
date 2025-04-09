import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import User from '../models/user.model.js';

const router = express.Router();

// Protected routes - require authentication
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

router.get("/anothertest", (req, res) => {
    res.status(200).send("Hello from user route");
});

// Get all users (admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    console.log('Fetching all users, requester:', req.user);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const users = await User.find({}, '-password');
    console.log('Found users:', users.length);
    
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error in /all route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Update user role (admin only)
router.patch('/:userId/role', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { role } = req.body;
    const validRoles = ['user', 'admin', 'staff'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user role',
      error: error.message 
    });
  }
});

// Delete user (admin only)
router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
});

console.log('User routes loaded');
console.log('User routes registered:');
console.log('- GET /profile');
console.log('- PUT /profile');
console.log('- GET /all');
console.log('- PATCH /:userId/role');
console.log('- DELETE /:userId');

export default router;