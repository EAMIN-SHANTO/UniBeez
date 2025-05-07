import express from 'express';
import { createShop, getAllShops, getShopById, updateShop, deleteShop, getShopsByOwner } from '../controllers/shop.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new shop (requires authentication)
router.post('/', verifyToken, createShop);

// Get all shops (public)
router.get('/', getAllShops);

// IMPORTANT: Put specific routes BEFORE parameter routes
router.get('/owned-by-user', verifyToken, getShopsByOwner);

// Get shop by ID (public)
router.get('/:id', getShopById);

// Update shop by ID (requires authentication)
router.put('/:id', verifyToken, updateShop);

// Delete shop by ID (requires authentication)
router.delete('/:id', verifyToken, deleteShop);

export default router;