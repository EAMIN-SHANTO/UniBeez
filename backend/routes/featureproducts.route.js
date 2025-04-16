import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();

import {
  featureProduct,
  unfeatureProduct,
  getFeatureProduct,
  getProductById,
} from '../controllers/featureproduct.controller.js';

// Route to feature a product - add verifyToken middleware
router.put('/feature-product', verifyToken, featureProduct);

// Route to unfeature a product - add verifyToken middleware
router.put('/unfeature-product/:productId', verifyToken, unfeatureProduct);

// Route to get featured product details
router.get('/featuredproduct/:id', getFeatureProduct);

// Route to get product by ID
router.get('/product/:id', getProductById);

export default router;
