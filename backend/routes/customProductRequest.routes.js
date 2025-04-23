import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createCustomProductRequest,
  getShopCustomRequests,
  getUserCustomRequests,
  getCustomRequestById,
  acceptCustomRequest,
  rejectCustomRequest
} from '../controllers/customProductRequest.controller.js';

const router = express.Router();

// Debug logging middleware 
router.use((req, res, next) => {
  console.log(`[CustomProductRequest] ${req.method} ${req.originalUrl}`);
  next();
});

// Apply auth middleware to all routes
router.use(verifyToken);

// Create a new custom product request
router.post('/', createCustomProductRequest);

// Get all custom product requests for the current user
router.get('/user', getUserCustomRequests);

// Get all custom product requests for a specific shop (shop owner only)
router.get('/shop/:shopId', getShopCustomRequests);

// Get a single custom product request by ID
router.get('/:requestId', getCustomRequestById);

// Accept a custom product request (shop owner only)
router.patch('/:requestId/accept', (req, res, next) => {
  console.log('[AcceptRequest] Route hit with params:', req.params);
  console.log('[AcceptRequest] Request body:', req.body);
  acceptCustomRequest(req, res, next);
});

// Reject a custom product request (shop owner only)
router.patch('/:requestId/reject', (req, res, next) => {
  console.log('[RejectRequest] Route hit with params:', req.params);
  console.log('[RejectRequest] Request body:', req.body);
  rejectCustomRequest(req, res, next);
});

// Error handler for this router
router.use((err, req, res, next) => {
  console.error(`[CustomProductRequest Error] ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({
    success: false,
    message: 'Error processing custom product request',
    error: err.message
  });
});

export default router;