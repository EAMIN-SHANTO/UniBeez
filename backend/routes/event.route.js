import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';
import { getAllEvents, createEvent, toggleCurrentEvent, updateEvent, deleteEvent, archiveEvent } from '../controllers/event.controller.js';
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
router.get('/events-21301429', getAllEvents);

// Create new event
router.post('/events-21301429', verifyToken, upload.single('bannerImage'), createEvent);

// Update event
router.put('/events-21301429/:eventId', verifyToken, updateEvent);

// Delete event
router.delete('/events-21301429/:eventId', verifyToken, deleteEvent);

// Archive event
router.patch('/events-21301429/:eventId/archive', verifyToken, archiveEvent);

// Toggle current event status
router.patch('/events-21301429/:eventId/toggle-current', verifyToken, toggleCurrentEvent);

export default router; 