import express from 'express';
<<<<<<< HEAD
import { createShop, getAllShops, getShopById, updateShop, deleteShop } from '../controllers/shop.controller.js';
=======
import { createShop, getAllShops, getShopById } from '../controllers/shop.controller.js';
>>>>>>> ar15
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new shop (requires authentication)
router.post('/', verifyToken, createShop);

// Get all shops (public)
router.get('/', getAllShops);

// Get shop by ID (public)
router.get('/:id', getShopById);

<<<<<<< HEAD
// Update shop by ID (requires authentication)
router.put('/:id', verifyToken, updateShop);

// Delete shop by ID (requires authentication)
router.delete('/:id', verifyToken, deleteShop);

=======
>>>>>>> ar15
export default router;