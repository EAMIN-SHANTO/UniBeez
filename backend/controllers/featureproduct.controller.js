import Product from '../models/product.model.js';
import mongoose from 'mongoose'; // Added missing import

// Feature a product
export const featureProduct = async (req, res) => {
  try {
    const { productId, startDate, duration, durationType, paymentMethod, transactionId } = req.body;
    const userId = req.user._id; // Extract userId from authenticated user

    // Validate required fields
    if (!productId || !startDate || !duration || !durationType || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update product's isFeatured status
    product.isFeatured = true;
    await product.save();

    // Save feature request record
    const featureRequest = new FeatureRequest({
      productId,
      userId, // Include userId
      startDate,
      duration,
      durationType,
      paymentMethod,
      transactionId,
      status: 'approved',
    });
    await featureRequest.save();

    res.status(200).json({
      success: true,
      message: 'Product featured successfully',
      product,
      featureRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to feature product',
      error: error.message,
    });
  }
};

// Remove product from featured section
export const unfeatureProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update product's isFeatured status
    product.isFeatured = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product unfeatured successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unfeature product',
      error: error.message,
    });
  }
};

// Get featured product details
export const getFeatureProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name logo owner');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the product is featured
    if (!product.isFeatured) {
      return res.status(400).json({
        success: false,
        message: 'Product is not featured',
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id).populate({
      path: 'shop',
      select: 'name owner',
      populate: {
        path: 'owner',
        select: '_id username',
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};