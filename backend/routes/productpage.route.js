import express from 'express';
import { createProduct, getAllShopProducts, getProductById, deleteProduct } from '../controllers/productpage.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product (requires authentication)
router.post('/', verifyToken, createProduct);

// Get all products (public)
router.get('/', getAllShopProducts);
router.get('/:id', getProductById);

// Delete a product (public access, no authentication required)
router.delete('/:id', deleteProduct);

export default router;