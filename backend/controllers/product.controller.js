import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, shopId, images, quantity } = req.body;
    
    // Validate input
    if (!name || !description || !price || !shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if shop exists and user is the owner
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add products to this shop'
      });
    }
    
    // Create new product
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      shop: shopId,
      images: images || [],
      quantity: quantity || 1
    });
    
    const savedProduct = await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};
export const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate({
          path: 'shop',
          select: 'name owner',
          populate: {
            path: 'owner',
            select: '_id username'
          }
        });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
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
// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, shop, minPrice, maxPrice, sort } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (shop) query.shop = shop;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Build sort options
    let sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    else if (sort === 'price-desc') sortOptions.price = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else sortOptions.createdAt = -1; // Default sort
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .populate('shop', 'name owner');
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};