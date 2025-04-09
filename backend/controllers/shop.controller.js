import Shop from '../models/shop.model.js';

// Create a new shop
export const createShop = async (req, res) => {
  try {
    const { name, description, category, university, logo } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create new shop
    const newShop = new Shop({
      name,
      description,
      category,
      university,
      logo: logo || 'https://png.pngtree.com/png-vector/20220129/ourmid/pngtree-store-front-isolated-vector-icon-grocery-sign-symbol-vector-png-image_44268366.jpg',
      owner: userId
    });
    
    const savedShop = await newShop.save();
    
    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      shop: savedShop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create shop',
      error: error.message
    });
  }
};

// Get all shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'active' })
      .populate('owner', 'username email');
    
    res.status(200).json({
      success: true,
      count: shops.length,
      shops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: error.message
    });
  }
};

// Get shop by ID
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'username email');
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop',
      error: error.message
    });
  }
};

// Update shop by ID
export const updateShop = async (req, res) => {
  try {
    const { name, description, category, university, logo } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find the shop
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    // Check if user is the shop owner
    if (shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this shop'
      });
    }
    
    // Update shop fields
    shop.name = name;
    shop.description = description;
    shop.category = category;
    shop.university = university || shop.university;
    shop.logo = logo || shop.logo;
    
    const updatedShop = await shop.save();
    
    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      shop: updatedShop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update shop',
      error: error.message
    });
  }
};

// Delete shop by ID
export const deleteShop = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the shop
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    // Check if user is the shop owner
    if (shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this shop'
      });
    }
    
    // Delete the shop
    await Shop.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop',
      error: error.message
    });
  }
};