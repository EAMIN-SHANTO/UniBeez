import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product (requires authentication)
router.post('/', verifyToken, createProduct);

// Get all products (public)
router.get('/', getAllProducts);

// Get product by ID (public)
router.get('/:id', getProductById);

// Update product (requires authentication)
router.put('/:id', verifyToken, updateProduct);

// Delete product (requires authentication)
router.delete('/:id', verifyToken, deleteProduct);

export default router; 