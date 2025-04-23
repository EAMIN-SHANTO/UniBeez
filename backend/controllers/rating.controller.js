import ProductRating from '../models/productRating.model.js';
import ShopRating from '../models/shopRating.model.js';
import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';
import mongoose from 'mongoose';

// Rate a product and add a comment
export const rateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find product
    const product = await Product.findById(productId).populate('shop');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is owner of the product (can't rate own product)
    if (product.shop.owner.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot rate your own product'
      });
    }

    // Check if user has already rated this product
    let existingRating = await ProductRating.findOne({ product: productId, user: userId });

    let response;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || existingRating.comment;
      await existingRating.save();
      response = { success: true, message: 'Rating updated successfully', rating: existingRating };
    } else {
      // Create new rating
      const newRating = new ProductRating({
        product: productId,
        user: userId,
        rating,
        comment
      });
      await newRating.save();
      response = { success: true, message: 'Rating added successfully', rating: newRating };
    }

    // Update product average rating
    await updateProductAverageRating(productId);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error rating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rate product',
      error: error.message
    });
  }
};

// Get ratings for a product
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 3 } = req.query; // Default to latest 3 comments

    const ratings = await ProductRating.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'username img');

    const totalCount = await ProductRating.countDocuments({ product: productId });

    return res.status(200).json({
      success: true,
      ratings,
      totalCount
    });
  } catch (error) {
    console.error('Error getting product ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product ratings',
      error: error.message
    });
  }
};

// Rate a shop
export const rateShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if user is owner of the shop (can't rate own shop)
    if (shop.owner.toString() === userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot rate your own shop'
      });
    }

    // Check if user has already rated this shop
    let existingRating = await ShopRating.findOne({ shop: shopId, user: userId });

    let response;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
      response = { success: true, message: 'Shop rating updated successfully', rating: existingRating };
    } else {
      // Create new rating
      const newRating = new ShopRating({
        shop: shopId,
        user: userId,
        rating
      });
      await newRating.save();
      response = { success: true, message: 'Shop rating added successfully', rating: newRating };
    }

    // Update shop average rating
    await updateShopAverageRating(shopId);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error rating shop:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rate shop',
      error: error.message
    });
  }
};

// Get ratings for a shop
export const getShopRatings = async (req, res) => {
  try {
    const { shopId } = req.params;

    const ratings = await ShopRating.find({ shop: shopId })
      .populate('user', 'username img');

    return res.status(200).json({
      success: true,
      ratings
    });
  } catch (error) {
    console.error('Error getting shop ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get shop ratings',
      error: error.message
    });
  }
};

// Check if user has rated a product or shop
export const checkUserRating = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id;

    let rating;
    if (type === 'product') {
      rating = await ProductRating.findOne({ product: id, user: userId });
    } else if (type === 'shop') {
      rating = await ShopRating.findOne({ shop: id, user: userId });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating type'
      });
    }

    return res.status(200).json({
      success: true,
      hasRated: !!rating,
      rating: rating
    });
  } catch (error) {
    console.error('Error checking user rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check user rating',
      error: error.message
    });
  }
};

// Helper function to update product's average rating
async function updateProductAverageRating(productId) {
  const result = await ProductRating.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: result[0].avgRating,
      reviewCount: result[0].count
    });
  }
}

// Helper function to update shop's average rating
async function updateShopAverageRating(shopId) {
  const result = await ShopRating.aggregate([
    { $match: { shop: new mongoose.Types.ObjectId(shopId) } },
    { $group: {
        _id: '$shop',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await Shop.findByIdAndUpdate(shopId, {
      rating: result[0].avgRating,
      reviewCount: result[0].count
    });
  }
}