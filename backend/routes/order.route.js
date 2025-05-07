import express from 'express';
import { 
  getShopOrders, 
  getOrderDetails, 
  updateOrderStatus, 
  getUserOrders,
  cancelOrder // Add this import
} from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all orders for a shop owner
router.get('/shop-orders', getShopOrders);

// Get user's own orders
router.get('/user-orders', getUserOrders);

// Get specific order details
router.get('/:id', getOrderDetails);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Cancel an order
router.patch('/:id/cancel', cancelOrder);

export default router;