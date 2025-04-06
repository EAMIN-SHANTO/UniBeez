import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';
import { getAllProducts, createProduct } from '../controllers/product.controller.js';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Create new product with file upload (admin/staff only)
router.post('/', verifyToken, (req, res, next) => {
  // Check if the user has the required role
  if (!['admin', 'staff'].includes(req.user.role)) {
    console.log('Access denied for role:', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  upload.single('bannerImage')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err instanceof multer.MulterError ? 'File upload error' : 'Only image files are allowed',
        error: err.message
      });
    }
    next();
  });
}, createProduct);

export default router;