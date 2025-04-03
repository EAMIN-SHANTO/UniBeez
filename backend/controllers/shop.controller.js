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
      logo: logo || 'https://via.placeholder.com/150',
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