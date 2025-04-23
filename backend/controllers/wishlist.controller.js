import Wishlist from '../models/wishlist.model.js';

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find or create the user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    
    if (!wishlist) {
      wishlist = { products: [] };
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
};

// Toggle product in wishlist (add if not present, remove if present)
export const toggleWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Find or create the user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }

    // Check if product is already in wishlist
    const productIndex = wishlist.products.indexOf(productId);
    
    if (productIndex === -1) {
      // Add product to wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      
      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        isAdded: true
      });
    } else {
      // Remove product from wishlist
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      
      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        isAdded: false
      });
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wishlist',
      error: error.message
    });
  }
};

// Check if a product is in user's wishlist
export const checkWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    const isInWishlist = wishlist ? wishlist.products.includes(productId) : false;

    res.status(200).json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist item',
      error: error.message
    });
  }
}; 