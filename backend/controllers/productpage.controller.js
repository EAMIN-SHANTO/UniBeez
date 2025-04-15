import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';
//import productpage from '../models/productpage.model.js';
// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, shopId, images, quantity } = req.body;

    if (!name || !description || !price || !shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

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

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
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

//from all shops
export const getAllShopProducts = async (req, res) => {
  try {
    const {
      category,
      shop,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (shop) query.shop = shop;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('shop', 'name owner');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, quantity } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, images, quantity },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

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

