import express from 'express';
import { createShop, getAllShops, getShopById } from '../controllers/shop.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new shop (requires authentication)
router.post('/', verifyToken, createShop);

// Get all shops (public)
router.get('/', getAllShops);

// Get shop by ID (public)
router.get('/:id', getShopById);

export default router;