import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';
import { getAllEvents, createEvent } from '../controllers/event.controller.js';
import multer from 'multer';

const router = express.Router();

// Get all events
router.get('/', getAllEvents);

// Create new event with file upload (admin/staff only)
router.post('/', verifyToken, (req, res) => {
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

export default router; 