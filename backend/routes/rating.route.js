import express from 'express';
import { 
  rateProduct, 
  getProductRatings, 
  rateShop, 
  getShopRatings, 
  checkUserRating 
} from '../controllers/rating.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Product rating routes
router.post('/products/:productId', verifyToken, rateProduct);
router.get('/products/:productId', getProductRatings);

// Shop rating routes
router.post('/shops/:shopId', verifyToken, rateShop);
router.get('/shops/:shopId', getShopRatings);

// Check if user has rated a product/shop
router.get('/check/:type/:id', verifyToken, checkUserRating);

export default router;