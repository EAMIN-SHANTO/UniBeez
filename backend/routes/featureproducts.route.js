import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();

import {
  featureProduct,
  unfeatureProduct,
  getFeatureProduct,
  getProductById,
  getAllFeatureRequests,
  updateFeatureRequestStatus
} from '../controllers/featureproduct.controller.js';

// Route to feature a product - add verifyToken middleware
router.post('/feature-product/:productId', verifyToken, featureProduct);

// Route to unfeature a product - add verifyToken middleware
router.put('/unfeature-product/:productId', verifyToken, unfeatureProduct);

// Route to get featured product details
router.get('/featuredproduct/:id', getFeatureProduct);

// Route to get product by ID
router.get('/product/:id', getProductById);

// Route to get all feature requests - with verifyToken to ensure only authorized users can access
router.get('/feature-requests', verifyToken, getAllFeatureRequests);

// Route to update feature request status
router.put('/request-status/:id', verifyToken, updateFeatureRequestStatus);

export default router;
