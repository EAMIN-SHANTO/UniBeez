import express from 'express';
const router = express.Router();

import {
  featureProduct,
  unfeatureProduct,
  getFeatureProduct,
  getProductById,
} from '../controllers/featureproduct.controller.js';

// Route to feature a product
router.put('/feature-product',  featureProduct);

// Route to unfeature a product
router.put('/unfeature-product/:productId', unfeatureProduct);

// Route to get featured product details
router.get('/featuredproduct/:id', getFeatureProduct);

// Route to get product by ID
router.get('/product/:id', getProductById);

export default router;
