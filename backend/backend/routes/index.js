import express from 'express';
import userRoutes from './user.routes.js';
import productPageRoutes from './productPage.routes.js';

const router = express.Router();

router.use('/api/users', userRoutes);
router.use('/api/productpages', productPageRoutes);

export default router;