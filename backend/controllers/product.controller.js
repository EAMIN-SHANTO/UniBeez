import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    console.log('Received product creation request:', req.body);
    const { name, description, price, category, images, quantity } = req.body;
    const shopId = req.body.shop;
    const userId = req.user._id;
    
    // Validate required fields
    if (!name || !description || !price || !category || !shopId) {
      console.log('Missing required fields:', { name, description, price, category, shopId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Verify shop exists and user is the owner
    console.log('Finding shop with ID:', shopId);
    const shop = await Shop.findById(shopId);
    if (!shop) {
      console.log('Shop not found with ID:', shopId);
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('Shop owner:', shop.owner, 'Current user:', userId);
    // Check if user is shop owner
    if (shop.owner.toString() !== userId.toString()) {
      console.log('Permission denied - user is not shop owner');
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
      images: images || [],
      shop: shopId,
      quantity: quantity || 0,
      inStock: (quantity && quantity > 0) || false
    });
    
    console.log('Attempting to save product:', newProduct);
    const savedProduct = await newProduct.save();
    console.log('Product saved successfully:', savedProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Get all products (with optional shop filter)
export const getAllProducts = async (req, res) => {
  try {
    const { shop } = req.query;
    let query = {};
    
    // If shop ID is provided, filter by shop
    if (shop) {
      query.shop = shop;
    }
    
    const products = await Product.find(query)
      .populate('shop', 'name logo');
    
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

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name logo owner');
    
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

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, status } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Verify user is shop owner
    const shop = await Shop.findById(product.shop);
    if (!shop || shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this product'
      });
    }
    
    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (status) product.status = status;
    
    const updatedProduct = await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Verify user is shop owner
    const shop = await Shop.findById(product.shop);
    if (!shop || shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this product'
      });
    }
    
    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};