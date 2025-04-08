import express from 'express';
import {
  createProductPage,
  getAllProductPages,
  getProductPageById,
  updateProductPage,
  deleteProductPage
} from '../controllers/productpage.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new product page (requires authentication)
router.post('/', verifyToken, createProductPage);

// Get all product pages (public)
router.get('/', getAllProductPages);

// Get a product page by ID (public)
router.get('/:id', getProductPageById);

// Update a product page (requires authentication)
router.put('/:id', verifyToken, updateProductPage);

// Delete a product page (requires authentication)
router.delete('/:id', verifyToken, deleteProductPage);

export default router;
