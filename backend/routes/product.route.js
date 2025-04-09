import express from 'express';
<<<<<<< HEAD
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';
=======
import { createProduct, getAllProducts, getProductById } from '../controllers/product.controller.js';
>>>>>>> ar15
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product (requires authentication)
router.post('/', verifyToken, createProduct);

// Get all products (public)
router.get('/', getAllProducts);
<<<<<<< HEAD

// Get product by ID (public)
router.get('/:id', getProductById);

// Update product (requires authentication)
router.put('/:id', verifyToken, updateProduct);

// Delete product (requires authentication)
router.delete('/:id', verifyToken, deleteProduct);

export default router; 
=======
router.get('/:id', getProductById);

export default router;
>>>>>>> ar15
