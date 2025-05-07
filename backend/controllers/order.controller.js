import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Shop from '../models/shop.model.js';
import mongoose from 'mongoose';
// Get all orders for a shop owner
export const getShopOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // First, find all shops owned by this user
    const userShops = await Shop.find({ owner: userId }).select('_id');
    const shopIds = userShops.map(shop => shop._id);
    
    if (shopIds.length === 0) {
      return res.status(200).json({
        success: true,
        orders: []
      });
    }
    
    // Find all orders that contain items from these shops
    const orders = await Order.find({
      'items.shop': { $in: shopIds }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'user',
      select: 'username email'
    })
    .populate({
      path: 'items.product',
      select: 'name images price'
    })
    .populate({
      path: 'items.shop', 
      select: 'name'
    });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop orders',
      error: error.message
    });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    
    // Check if orderId is valid
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    // Find the order
    const order = await Order.findById(orderId)
      .populate('user', 'username email')
      .populate('items.product', 'name images price')
      .populate('items.shop', 'name');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is the order owner or owns any of the shops in the order
    const userShops = await Shop.find({ owner: userId }).select('_id');
    const shopIds = userShops.map(shop => shop._id.toString());
    
    const isShopOwner = order.items.some(item => 
      shopIds.includes(item.shop._id.toString())
    );
    
    const isOrderOwner = order.user._id.toString() === userId.toString();
    
    if (!isOrderOwner && !isShopOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, itemIds } = req.body;
    const userId = req.user._id;
    
    if (!['processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find the order
    const order = await Order.findById(id)
      .populate('items.shop', 'name owner');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get shops owned by the user
    const shops = await Shop.find({ owner: userId }).select('_id');
    const shopIds = shops.map(shop => shop._id.toString());
    
    // If specific item IDs are provided, update only those items
    if (itemIds && itemIds.length > 0) {
      for (const itemId of itemIds) {
        const item = order.items.id(itemId);
        
        if (!item) {
          return res.status(404).json({
            success: false,
            message: `Item with ID ${itemId} not found in the order`
          });
        }
        
        // Check if the user owns the shop that sold this item
        if (!shopIds.includes(item.shop._id.toString())) {
          return res.status(403).json({
            success: false,
            message: `You don't have permission to update item ${itemId}`
          });
        }
        
        item.status = status;
      }
    } else {
      // Update all items that belong to the user's shops
      for (const item of order.items) {
        if (shopIds.includes(item.shop._id.toString())) {
          item.status = status;
        }
      }
    }
    
    await order.save();
    
    // Return a populated version of the order
    const updatedOrder = await Order.findById(id)
      .populate('user', 'username email')
      .populate('items.product', 'name images price')
      .populate('items.shop', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get user's own orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all orders for this user
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.product',
        select: 'name images price'
      });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders',
      error: error.message
    });
  }
};

// Cancel user's order
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns this order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this order'
      });
    }
    
    // Check if all items are in processing status
    const allProcessing = order.items.every(item => item.status === 'processing');
    
    if (!allProcessing) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order - some items are already shipped or delivered'
      });
    }
    
    // Update all items to cancelled status
    for (const item of order.items) {
      item.status = 'cancelled';
    }
    
    await order.save();
    
    // Return populated version of the order
    const updatedOrder = await Order.findById(orderId)
      .populate('items.product', 'name images price')
      .populate('items.shop', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};