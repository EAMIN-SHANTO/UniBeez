import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  toggleCurrentEvent
} from '../controllers/event.controller.js';

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

// Public routes
router.get('/', getAllEvents);

// Protected routes with file upload
router.post('/', verifyToken, upload.single('bannerImage'), createEvent);
router.put('/:eventId', verifyToken, upload.single('bannerImage'), updateEvent);

// Other protected routes
router.delete('/:eventId', verifyToken, deleteEvent);
router.patch('/:eventId/archive', verifyToken, archiveEvent);
router.patch('/:eventId/toggle-current', verifyToken, toggleCurrentEvent);

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'Event routes are working!' });
});

export default router; 