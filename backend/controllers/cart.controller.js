import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find cart or create if doesn't exist
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price images description discount'
      });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }
    
    // Calculate any active discounts
    const cartWithDiscounts = cart.toObject();
    let totalDiscount = 0;
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = item.product;
      
      if (product.discount?.isActive) {
        // Check for active flash sale
        if (product.discount.type === 'flash_sale') {
          const now = new Date();
          if (now >= product.discount.startDate && now <= product.discount.endDate) {
            const discountAmount = item.price * (product.discount.value / 100);
            const discountedPrice = item.price - discountAmount;
            
            cartWithDiscounts.items[i].originalPrice = item.price;
            cartWithDiscounts.items[i].discountedPrice = discountedPrice;
            cartWithDiscounts.items[i].discountPercentage = product.discount.value;
            cartWithDiscounts.items[i].discountType = 'flash_sale';
            
            totalDiscount += discountAmount * item.quantity;
          }
        } else if (product.discount.type === 'voucher') {
          // Just mark that this product has a voucher available
          cartWithDiscounts.items[i].hasVoucher = true;
          cartWithDiscounts.items[i].discountPercentage = product.discount.value;
          cartWithDiscounts.items[i].discountType = 'voucher';
        }
      }
    }
    
    cartWithDiscounts.totalDiscount = totalDiscount;
    cartWithDiscounts.finalAmount = cart.totalAmount - totalDiscount;
    
    res.status(200).json({
      success: true,
      cart: cartWithDiscounts
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.inStock || product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or has insufficient quantity'
      });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await cart.save();
    
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'name price images description discount'
    });
    
    // Calculate any active discounts
    const cartWithDiscounts = cart.toObject();
    let totalDiscount = 0;
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = item.product;
      
      if (product.discount?.isActive) {
        // Check for active flash sale
        if (product.discount.type === 'flash_sale') {
          const now = new Date();
          if (now >= product.discount.startDate && now <= product.discount.endDate) {
            const discountAmount = item.price * (product.discount.value / 100);
            const discountedPrice = item.price - discountAmount;
            
            cartWithDiscounts.items[i].originalPrice = item.price;
            cartWithDiscounts.items[i].discountedPrice = discountedPrice;
            cartWithDiscounts.items[i].discountPercentage = product.discount.value;
            cartWithDiscounts.items[i].discountType = 'flash_sale';
            
            totalDiscount += discountAmount * item.quantity;
          }
        } else if (product.discount.type === 'voucher') {
          // Just mark that this product has a voucher available
          cartWithDiscounts.items[i].hasVoucher = true;
          cartWithDiscounts.items[i].discountPercentage = product.discount.value;
          cartWithDiscounts.items[i].discountType = 'voucher';
        }
      }
    }
    
    cartWithDiscounts.totalDiscount = totalDiscount;
    cartWithDiscounts.finalAmount = cart.totalAmount - totalDiscount;
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: cartWithDiscounts
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, quantity } = req.body;
    
    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'name price images description discount'
    });
    
    // Calculate any active discounts
    const cartWithDiscounts = cart.toObject();
    let totalDiscount = 0;
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = item.product;
      
      if (product.discount?.isActive) {
        // Check for active flash sale
        if (product.discount.type === 'flash_sale') {
          const now = new Date();
          if (now >= product.discount.startDate && now <= product.discount.endDate) {
            const discountAmount = item.price * (product.discount.value / 100);
            const discountedPrice = item.price - discountAmount;
            
            cartWithDiscounts.items[i].originalPrice = item.price;
            cartWithDiscounts.items[i].discountedPrice = discountedPrice;
            cartWithDiscounts.items[i].discountPercentage = product.discount.value;
            cartWithDiscounts.items[i].discountType = 'flash_sale';
            
            totalDiscount += discountAmount * item.quantity;
          }
        } else if (product.discount.type === 'voucher') {
          // Just mark that this product has a voucher available
          cartWithDiscounts.items[i].hasVoucher = true;
          cartWithDiscounts.items[i].discountPercentage = product.discount.value;
          cartWithDiscounts.items[i].discountType = 'voucher';
        }
      }
    }
    
    cartWithDiscounts.totalDiscount = totalDiscount;
    cartWithDiscounts.finalAmount = cart.totalAmount - totalDiscount;
    
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: cartWithDiscounts
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    await cart.save();
    
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'name price images description discount'
    });
    
    // Calculate any active discounts
    const cartWithDiscounts = cart.toObject();
    let totalDiscount = 0;
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = item.product;
      
      if (product.discount?.isActive) {
        // Check for active flash sale
        if (product.discount.type === 'flash_sale') {
          const now = new Date();
          if (now >= product.discount.startDate && now <= product.discount.endDate) {
            const discountAmount = item.price * (product.discount.value / 100);
            const discountedPrice = item.price - discountAmount;
            
            cartWithDiscounts.items[i].originalPrice = item.price;
            cartWithDiscounts.items[i].discountedPrice = discountedPrice;
            cartWithDiscounts.items[i].discountPercentage = product.discount.value;
            cartWithDiscounts.items[i].discountType = 'flash_sale';
            
            totalDiscount += discountAmount * item.quantity;
          }
        } else if (product.discount.type === 'voucher') {
          // Just mark that this product has a voucher available
          cartWithDiscounts.items[i].hasVoucher = true;
          cartWithDiscounts.items[i].discountPercentage = product.discount.value;
          cartWithDiscounts.items[i].discountType = 'voucher';
        }
      }
    }
    
    cartWithDiscounts.totalDiscount = totalDiscount;
    cartWithDiscounts.finalAmount = cart.totalAmount - totalDiscount;
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: cartWithDiscounts
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear all items
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Apply voucher discount to cart items
export const applyVoucher = async (req, res) => {
  try {
    const userId = req.user._id;
    const { voucherCode } = req.body;
    
    if (!voucherCode) {
      return res.status(400).json({
        success: false,
        message: 'Voucher code is required'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price discount'
    });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Check if any cart items have this voucher code
    let voucherFound = false;
    let totalDiscount = 0;
    const cartWithDiscounts = cart.toObject();
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = item.product;
      
      // Check for flash sale discounts first
      if (product.discount?.isActive && product.discount.type === 'flash_sale') {
        const now = new Date();
        if (now >= product.discount.startDate && now <= product.discount.endDate) {
          const discountAmount = item.price * (product.discount.value / 100);
          const discountedPrice = item.price - discountAmount;
          
          cartWithDiscounts.items[i].originalPrice = item.price;
          cartWithDiscounts.items[i].discountedPrice = discountedPrice;
          cartWithDiscounts.items[i].discountPercentage = product.discount.value;
          cartWithDiscounts.items[i].discountType = 'flash_sale';
          
          totalDiscount += discountAmount * item.quantity;
        }
      }
      
      // Then check for voucher discounts
      if (product.discount?.isActive && product.discount.type === 'voucher' && 
          product.discount.voucherCode === voucherCode) {
        const discountAmount = item.price * (product.discount.value / 100);
        const discountedPrice = item.price - discountAmount;
        
        cartWithDiscounts.items[i].originalPrice = item.price;
        cartWithDiscounts.items[i].discountedPrice = discountedPrice;
        cartWithDiscounts.items[i].discountPercentage = product.discount.value;
        cartWithDiscounts.items[i].discountType = 'voucher';
        cartWithDiscounts.items[i].voucherApplied = true;
        
        totalDiscount += discountAmount * item.quantity;
        voucherFound = true;
      }
    }
    
    if (!voucherFound) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher code or no applicable products in cart'
      });
    }
    
    cartWithDiscounts.totalDiscount = totalDiscount;
    cartWithDiscounts.finalAmount = cart.totalAmount - totalDiscount;
    cartWithDiscounts.voucherApplied = voucherCode;
    
    res.status(200).json({
      success: true,
      message: 'Voucher applied successfully',
      cart: cartWithDiscounts
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply voucher',
      error: error.message
    });
  }
};

// Process checkout
export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, voucherCode } = req.body;
    
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price quantity discount shop'
    });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Calculate discounts
    let totalDiscount = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = item.product;
      let discountedPrice = item.price;
      let discountType = 'none';
      let discountPercentage = 0;
      
      // Check for flash sale discounts
      if (product.discount?.isActive && product.discount.type === 'flash_sale') {
        const now = new Date();
        if (now >= product.discount.startDate && now <= product.discount.endDate) {
          discountPercentage = product.discount.value;
          discountedPrice = item.price - (item.price * (discountPercentage / 100));
          discountType = 'flash_sale';
          totalDiscount += (item.price - discountedPrice) * item.quantity;
        }
      }
      
      // Check for voucher discounts
      if (voucherCode && product.discount?.isActive && 
          product.discount.type === 'voucher' && 
          product.discount.voucherCode === voucherCode) {
        discountPercentage = product.discount.value;
        discountedPrice = item.price - (item.price * (discountPercentage / 100));
        discountType = 'voucher';
        totalDiscount += (item.price - discountedPrice) * item.quantity;
      }
      
      orderItems.push({
        product: product._id,
        shop: product.shop,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        discountedPrice,
        discountType,
        discountPercentage,
        status: 'processing'
      });
    }
    
    const finalAmount = cart.totalAmount - totalDiscount;
    
    // Generate random order ID
    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    
    res.status(200).json({
      success: true,
      message: 'Checkout successful',
      orderId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      totalDiscount,
      finalAmount,
      voucherApplied: voucherCode || null
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Checkout failed',
      error: error.message
    });
  }
};

// Process payment and create order
export const processPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, paymentMethod, paymentDetails, shippingAddress, voucherCode } = req.body;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price quantity _id discount shop'
    });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Calculate discounts and verify inventory
    let totalDiscount = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product.name}`
        });
      }
      
      if (!product.inStock || product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}. Available: ${product.quantity}`
        });
      }
      
      let discountedPrice = item.price;
      let discountType = 'none';
      let discountPercentage = 0;
      
      // Check for flash sale discounts
      if (product.discount?.isActive && product.discount.type === 'flash_sale') {
        const now = new Date();
        if (now >= product.discount.startDate && now <= product.discount.endDate) {
          discountPercentage = product.discount.value;
          discountedPrice = item.price - (item.price * (discountPercentage / 100));
          discountType = 'flash_sale';
          totalDiscount += (item.price - discountedPrice) * item.quantity;
        }
      }
      
      // Check for voucher discounts
      if (voucherCode && product.discount?.isActive && 
          product.discount.type === 'voucher' && 
          product.discount.voucherCode === voucherCode) {
        discountPercentage = product.discount.value;
        discountedPrice = item.price - (item.price * (discountPercentage / 100));
        discountType = 'voucher';
        totalDiscount += (item.price - discountedPrice) * item.quantity;
      }
      
      orderItems.push({
        product: product._id,
        shop: product.shop,
        quantity: item.quantity,
        price: item.price,
        discountedPrice,
        discountType,
        discountPercentage,
        status: 'processing'
      });
    }
    
    const totalAmount = cart.totalAmount;
    const finalAmount = totalAmount - totalDiscount;
    
    // Generate confirmation ID
    const confirmationId = `CONF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Create new order with discount information
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      totalAmount,
      totalDiscount,
      finalAmount,
      orderId,
      confirmationId,
      voucherApplied: voucherCode || null
    });
    
    // Save the order
    await newOrder.save();
    
    // Update product quantities
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        // Decrease the quantity
        product.quantity -= item.quantity;
        
        // If quantity reaches 0, mark as out of stock
        if (product.quantity <= 0) {
          product.quantity = 0;
          product.inStock = false;
        }
        
        // Save the updated product
        await product.save();
      }
    }
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      confirmationId,
      order: {
        _id: newOrder._id,
        orderId: newOrder.orderId
      },
      totalAmount,
      totalDiscount,
      finalAmount,
      voucherApplied: voucherCode || null
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};