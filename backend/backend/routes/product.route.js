import express from 'express';
import { createProduct, getAllProducts, getProductById } from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product (requires authentication)
router.post('/', verifyToken, createProduct);

// Get all products (public)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;