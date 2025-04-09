import express from 'express';
import { register, login, getProfile, logout, test } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Add a test route to verify the router is working
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

// Public routes
router.get('/test', test);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', verifyToken, getProfile);

export default router; 