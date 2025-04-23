import Product from '../models/product.model.js';
import FeatureRequest from '../models/featurerequest.model.js'; // Add this import
import mongoose from 'mongoose'; // Added missing import

// Feature a product
export const featureProduct = async (req, res) => {
  try {
    console.log('Feature product request body:', req.body);
    console.log('User:', req.user);
    const { productId, startDate, duration, durationType, paymentMethod, transactionId, amount } = req.body;
    const userId = req.user._id; // Extract userId from authenticated user

    // Validate required fields
    if (!productId || !startDate || !duration || !durationType || !paymentMethod || !transactionId || typeof amount !== 'number') {
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
      userId,
      startDate,
      duration,
      durationType,
      paymentMethod,
      transactionId,
      amount, // save amount
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
    console.error('Feature product error:', error);
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





// Get all feature requests
export const getAllFeatureRequests = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, productId, userId } = req.query;
    const filter = {};
    
    // Add filters if provided in query parameters
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }
    
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.productId = productId;
    }
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }
    
    const featureRequests = await FeatureRequest.find(filter)
      .populate({
        path: 'productId',
        select: 'name price images category isFeatured shop',
        populate: {
          path: 'shop',
          select: 'name'
        }
      })
      .populate({
        path: 'userId',
        select: 'username email'
      })
      .select('productId userId startDate duration durationType paymentMethod transactionId amount status createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: featureRequests.length,
      featureRequests
    });
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature requests',
      error: error.message
    });
  }
};







// Update feature request status
export const updateFeatureRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const featureRequest = await FeatureRequest.findById(id);
    
    if (!featureRequest) {
      return res.status(404).json({
        success: false,
        message: 'Feature request not found'
      });
    }
    
    // If approving, update product's featured status
    if (status === 'approved' && featureRequest.status !== 'approved') {
      const product = await Product.findById(featureRequest.productId);
      if (product) {
        product.isFeatured = true;
        await product.save();
      }
    }
    
    // If rejecting a previously approved request, unfeature the product
    if (status === 'rejected' && featureRequest.status === 'approved') {
      const product = await Product.findById(featureRequest.productId);
      if (product) {
        product.isFeatured = false;
        await product.save();
      }
    }
    
    featureRequest.status = status;
    await featureRequest.save();
    
    res.status(200).json({
      success: true,
      message: `Feature request ${status} successfully`,
      featureRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update feature request status',
      error: error.message
    });
  }
};
