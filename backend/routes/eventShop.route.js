import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { 
  registerEventShop, 
  getEventShops, 
  getUserShops,
  removeEventShop 
} from '../controllers/eventShop.controller.js';

const router = express.Router();

// Get user's shops
router.get('/user-shops', verifyToken, getUserShops);

// Register a shop for an event
router.post('/:eventId/register', verifyToken, registerEventShop);

// Get all shops for an event
router.get('/:eventId/shops', getEventShops);

// Remove shop from event
router.delete('/:eventId/shops/:shopId', verifyToken, removeEventShop);

export default router; 