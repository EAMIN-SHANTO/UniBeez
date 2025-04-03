import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';
import { getAllEvents, createEvent, toggleCurrentEvent } from '../controllers/event.controller.js';
import multer from 'multer';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Event route hit:', {
    method: req.method,
    url: req.url,
    params: req.params,
    path: req.path,
    user: req.user?.role
  });
  next();
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Event routes are working' });
});

// Get all events
router.get('/', getAllEvents);

// Create new event with file upload (admin/staff only)
router.post('/', verifyToken, (req, res) => {
  upload.single('bannerImage')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        console.error('Other upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      await createEvent(req, res);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({
        success: false,
        message: 'Error in route',
        error: error.message
      });
    }
  });
});

// Toggle current event status
router.patch('/:eventId/toggle-current', verifyToken, toggleCurrentEvent);

export default router; 