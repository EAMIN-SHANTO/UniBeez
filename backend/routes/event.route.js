import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import Event from '../models/event.model.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ startDate: 1 })
      .populate('organizer', 'username');
    
    res.status(200).json({
      success: true,
      events: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Create new event (admin/staff only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });

    await event.save();
    res.status(201).json({
      success: true,
      event: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

export default router; 