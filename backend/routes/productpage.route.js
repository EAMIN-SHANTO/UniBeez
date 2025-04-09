import express from 'express';
import {
  createProductPage,
  getAllProductPages,
  getProductPageById,
  updateProductPage,
  deleteProductPage
} from '../controllers/productpage.controller.js';
import {
  createProduct,
  getAllProducts,
  getProductById
} from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Product routes
router
  .route('/')
  .get(getAllProducts) // Get all products
  .post(verifyToken, createProduct); // Create a new product (requires authentication)

router
  .route('/:id')
  .get(getProductById); // Get a product by ID

// Product page routes
router
  .route('/pages')
  .get(getAllProductPages) // Get all product pages
  .post(verifyToken, createProductPage); // Create a new product page (requires authentication)

router
  .route('/pages/:id')
  .get(getProductPageById) // Get a product page by ID
  .put(verifyToken, updateProductPage) // Update a product page (requires authentication)
  .delete(verifyToken, deleteProductPage); // Delete a product page (requires authentication)

export default router;
