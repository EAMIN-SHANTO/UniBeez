import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    console.log('Received product creation request:', req.body);
    const { name, description, price, category, images, quantity, discount } = req.body;
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
      inStock: (quantity && quantity > 0) || false,
      discount: discount || {
        isActive: false,
        type: 'none',
        value: 0
      }
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
    
    // Calculate active discounts for each product
    const productsWithDiscounts = products.map(product => {
      const productObj = product.toObject();
      
      // Check if product has active flash sale
      if (product.discount?.isActive && product.discount.type === 'flash_sale') {
        const now = new Date();
        if (now >= product.discount.startDate && now <= product.discount.endDate) {
          productObj.discountedPrice = product.price - (product.price * (product.discount.value / 100));
          productObj.isDiscounted = true;
        }
      }
      
      // For voucher products, just indicate there's a voucher available
      if (product.discount?.isActive && product.discount.type === 'voucher') {
        productObj.hasVoucher = true;
      }
      
      return productObj;
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products: productsWithDiscounts
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
    
    const productObj = product.toObject();
    
    // Check if product has active flash sale
    if (product.discount?.isActive && product.discount.type === 'flash_sale') {
      const now = new Date();
      if (now >= product.discount.startDate && now <= product.discount.endDate) {
        productObj.discountedPrice = product.price - (product.price * (product.discount.value / 100));
        productObj.isDiscounted = true;
        productObj.discountEndsAt = product.discount.endDate;
      }
    }
    
    // For voucher products, indicate there's a voucher available
    if (product.discount?.isActive && product.discount.type === 'voucher') {
      productObj.hasVoucher = true;
      productObj.discountValue = product.discount.value;
      // Don't expose voucher code to regular users
    }
    
    res.status(200).json({
      success: true,
      product: productObj
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
    const { name, description, price, category, images, quantity, discount } = req.body;
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
    if (quantity !== undefined) product.quantity = quantity;
    if (quantity <= 0) product.inStock = false;
    else product.inStock = true;
    
    // Update discount fields if provided
    if (discount) {
      product.discount = {
        ...product.discount,
        ...discount
      };
      
      // Validate discount data
      if (discount.type === 'flash_sale') {
        if (!discount.startDate || !discount.endDate || discount.value <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Flash sale requires start date, end date, and a discount value'
          });
        }
      } else if (discount.type === 'voucher') {
        if (!discount.voucherCode || discount.value <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Voucher discount requires a voucher code and a discount value'
          });
        }
      }
    }
    
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

// Apply voucher discount to a product
export const applyVoucherDiscount = async (req, res) => {
  try {
    const { productId, voucherCode } = req.body;
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product has a valid voucher discount
    if (!product.discount?.isActive || product.discount.type !== 'voucher') {
      return res.status(400).json({
        success: false,
        message: 'No voucher discount available for this product'
      });
    }
    
    // Check if voucher code matches
    if (product.discount.voucherCode !== voucherCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher code'
      });
    }
    
    // Calculate discounted price
    const discountedPrice = product.price - (product.price * (product.discount.value / 100));
    
    res.status(200).json({
      success: true,
      message: 'Voucher discount applied successfully',
      discountedPrice,
      discountValue: product.discount.value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply voucher discount',
      error: error.message
    });
  }
};