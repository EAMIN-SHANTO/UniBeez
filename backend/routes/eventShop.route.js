import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { registerEventShop, getEventShops } from '../controllers/eventShop.controller.js';

const router = express.Router();

// Register a shop for an event
router.post('/:eventId/register', verifyToken, registerEventShop);

// Get all shops for an event
router.get('/:eventId/shops', getEventShops);

export default router; 