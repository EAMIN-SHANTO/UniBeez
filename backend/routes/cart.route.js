import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  checkout,
  processPayment // Add this import
} from '../controllers/cart.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

// Checkout
router.post('/checkout', checkout);

// Process payment
router.post('/process-payment', verifyToken, processPayment);

export default router;