import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

// Add debug route
router.get('/debug', (req, res) => {
  res.json({ message: 'Notification routes are accessible' });
});

// GET /api/notifications
router.get('/', verifyToken, getUserNotifications);

// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', verifyToken, markAsRead);

// PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, markAllAsRead);

// Log routes when they're registered
console.log('Notification routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

export default router; 