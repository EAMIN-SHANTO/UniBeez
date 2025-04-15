import express from 'express';
import { createProduct, getAllShopProducts, getProductById, deleteProduct, updateProduct } from '../controllers/productpage.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product (requires authentication)
router.post('/', verifyToken, createProduct);

// Get all products (public)
router.get('/', getAllShopProducts);
router.get('/:id', getProductById);

// Delete a product (public access, no authentication required)
router.delete('/:id', deleteProduct);
//router.put('/:id', updateProduct);

// Update a product (no authentication required)
router.patch('/updateProduct/:id', updateProduct);

export default router;