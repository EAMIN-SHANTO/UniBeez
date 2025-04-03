import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import Event from '../models/event.model.js';
import upload from '../config/multer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Create new event with file upload (admin/staff only)
router.post('/', verifyToken, (req, res) => {
  console.log('Starting event creation...');
  console.log('User:', req.user);

  upload.single('bannerImage')(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err instanceof multer.MulterError ? 'File upload error' : 'Only image files are allowed',
          error: err.message
        });
      }

      if (!['admin', 'staff'].includes(req.user.role)) {
        console.log('Access denied for role:', req.user.role);
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'Banner image is required'
        });
      }

      console.log('File uploaded:', req.file);
      console.log('Request body:', req.body);

      const eventData = {
        title: req.body.title,
        description: req.body.description,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        location: req.body.location,
        status: req.body.status || 'upcoming',
        bannerImage: `/uploads/events/${req.file.filename}`,
        organizer: req.user._id
      };

      console.log('Creating event with data:', eventData);

      const event = new Event(eventData);
      await event.save();

      console.log('Event created successfully:', event);

      res.status(201).json({
        success: true,
        event: event
      });
    } catch (error) {
      console.error('Event creation error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: error.message,
        details: error.stack
      });
    }
  });
});

export default router; 