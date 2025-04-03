import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import Product from '../models/product.model.js';
import upload from '../config/multer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .sort({ title: 1 })
      .populate('organizer', 'username');
    
    res.status(200).json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Create new product with file upload (admin/staff only)
router.post('/', verifyToken, (req, res) => {
  console.log('Starting product creation...');
  console.log('User:', req.user);

  upload.single('bannerImage')(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err instanceof multer.MulterError ? 'File upload error' : 'Only image files are allowed',
          error: err.message
        });
      }

      if (!['admin', 'staff'].includes(req.user.role)) {
        console.log('Access denied for role:', req.user.role);
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'Banner image is required'
        });
      }

      console.log('File uploaded:', req.file);
      console.log('Request body:', req.body);

      const productData = {
        title: req.body.title,
        description: req.body.description,
        bannerImage: `/uploads/products/${req.file.filename}`,
        status: req.body.status || 'Available',
        organizer: req.user._id
      };

      console.log('Creating product with data:', productData);

      const product = new Product(productData);
      await product.save();

      console.log('Product created successfully:', product);

      res.status(201).json({
        success: true,
        product: product
      });
    } catch (error) {
      console.error('Product creation error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message,
        details: error.stack
      });
    }
  });
});

export default router;