import Product from '../models/product.model.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { status, title } = req.query;

    const filter = { isAvailable: true };
    if (status) filter.status = status;
    if (title) filter.title = new RegExp(title, 'i'); // Case-insensitive search

    const products = await Product.find(filter)
      .sort({ title: 1 })
      .populate('organizer', 'username');

    res.status(200).json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    console.log('Starting product creation...');
    console.log('User:', req.user);

    // Check if the user has the required role
    if (!['admin', 'staff'].includes(req.user.role)) {
      console.log('Access denied for role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Banner image is required'
      });
    }

    console.log('File uploaded:', req.file);
    console.log('Request body:', req.body);

    const { title, description, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const productData = {
      title,
      description,
      bannerImage: `/uploads/products/${req.file.filename}`,
      status: status || 'Available',
      organizer: req.user._id
    };

    console.log('Creating product with data:', productData);

    const product = new Product(productData);
    await product.save();

    console.log('Product created successfully:', product);

    res.status(201).json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};
