import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { 
  getUserWishlist,
  toggleWishlistItem,
  checkWishlistItem
} from '../controllers/wishlist.controller.js';

const router = express.Router();

// Get user's wishlist
router.get('/', verifyToken, getUserWishlist);

// Toggle a product in the wishlist (add or remove)
router.post('/:productId', verifyToken, toggleWishlistItem);

// Check if a product is in user's wishlist
router.get('/check/:productId', verifyToken, checkWishlistItem);

export default router; 