import CustomProductRequest from '../models/customProductRequest.model.js';
import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { createNotification } from './notification.controller.js';

// Create a custom product request
export const createCustomProductRequest = async (req, res) => {
  try {
    const { shopId, productName, description, quantity, specialInstructions } = req.body;
    const userId = req.user._id;

    console.log('Create custom product request received with data:', {
      shopId, 
      productName, 
      description,
      quantity,
      specialInstructions,
      userId
    });

    // Validate required fields
    if (!shopId || !description) {
      console.log('Validation failed: Missing shopId or description');
      return res.status(400).json({
        success: false,
        message: 'Shop ID and product description are required'
      });
    }

    if (!productName || productName.trim().length < 3) {
      console.log('Validation failed: Missing or invalid productName');
      return res.status(400).json({
        success: false,
        message: 'Product name is required and must be at least 3 characters long'
      });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      console.log(`Shop with ID ${shopId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    console.log('Shop found:', shop.name);

    // Check that user is not the shop owner
    if (shop.owner.toString() === userId.toString()) {
      console.log('User is shop owner - cannot request from own shop');
      return res.status(403).json({
        success: false,
        message: 'You cannot request custom products from your own shop'
      });
    }

    // Create new custom product request
    const newRequest = new CustomProductRequest({
      shop: shopId,
      user: userId,
      productName,
      description,
      quantity: quantity || 1,
      specialInstructions: specialInstructions || ''
    });

    console.log('Created new request object:', newRequest);

    try {
      await newRequest.save();
      console.log('Request saved successfully with ID:', newRequest._id);
    } catch (saveError) {
      console.error('Error saving request:', saveError);
      console.error('Validation errors:', saveError.errors);
      return res.status(400).json({
        success: false,
        message: 'Error saving custom product request',
        errors: saveError.message
      });
    }

    // Get shop owner user ID for notification
    const shopOwnerId = typeof shop.owner === 'object' ? shop.owner._id : shop.owner;
    console.log('Shop owner ID for notification:', shopOwnerId);

    // Send notification to shop owner
    try {
      const shopOwner = await User.findById(shopOwnerId);
      if (shopOwner) {
        await createNotification({
          recipient: shopOwnerId,
          type: 'custom_product_request',
          title: 'New Custom Product Request',
          content: `You have received a new custom product request for ${shop.name}`,
          relatedModel: 'CustomProductRequest',
          relatedId: newRequest._id
        });
        console.log('Notification sent to shop owner');
      } else {
        console.log('Shop owner not found, notification not sent');
      }
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Continue with the response even if notification fails
    }

    console.log('Custom product request created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Custom product request created successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Error creating custom product request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom product request',
      error: error.message
    });
  }
};

// Get all custom product requests for a shop
export const getShopCustomRequests = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user._id;

    // Validate shop ID
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shop ID'
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

    const shopOwnerId = typeof shop.owner === 'object' ? shop.owner._id : shop.owner;
    if (shopOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these requests'
      });
    }

    // Get all requests for the shop
    const requests = await CustomProductRequest.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .populate('user', 'username email');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching shop custom requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom product requests',
      error: error.message
    });
  }
};

// Get all custom product requests by the current user
export const getUserCustomRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await CustomProductRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('shop', 'name logo');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching user custom requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom product requests',
      error: error.message
    });
  }
};

// Get a single custom product request by ID
export const getCustomRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    // Validate request ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await CustomProductRequest.findById(requestId)
      .populate('user', 'username email')
      .populate('shop', 'name logo owner');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom product request not found'
      });
    }

    // Check that user is either the requester or the shop owner
    const shopOwnerId = typeof request.shop.owner === 'object' 
      ? request.shop.owner._id 
      : request.shop.owner;
    
    if (request.user._id.toString() !== userId.toString() && 
        shopOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error fetching custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom product request',
      error: error.message
    });
  }
};

// Accept a custom product request
export const acceptCustomRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { price, shopOwnerNotes } = req.body;
    const userId = req.user._id;

    console.log(`Accept request for ID: ${requestId}, price: ${price}, from user ID: ${userId}`);

    // Validate input
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    // Find the request and populate both shop and user
    const request = await CustomProductRequest.findById(requestId)
      .populate({
        path: 'shop',
        select: 'name owner'
      })
      .populate({
        path: 'user',
        select: '_id username email'
      });

    if (!request) {
      console.log(`Request with ID ${requestId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Custom product request not found'
      });
    }

    console.log(`Found request: ${JSON.stringify(request)}`);

    // Check if user is the shop owner
    const shopOwnerId = typeof request.shop.owner === 'object' 
      ? request.shop.owner._id 
      : request.shop.owner;
    
    console.log(`Shop owner ID: ${shopOwnerId}, User ID: ${userId}`);
    
    if (shopOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only shop owner can accept this request'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status}`
      });
    }

    // Update the request
    request.status = 'accepted';
    request.price = parseFloat(price);
    request.shopOwnerNotes = shopOwnerNotes || '';
    await request.save();

    console.log('Request updated successfully');

    // Send notification to user
    try {
      // Get the customer ID (the user who made the request)
      const customerId = request.user._id;
      console.log('Sending notification to customer with ID:', customerId);

      await createNotification({
        recipient: customerId,
        type: 'custom_product_accepted',
        title: 'Custom Product Request Accepted',
        content: `Your custom product request for ${request.shop.name} has been accepted with a price of $${price}`,
        relatedModel: 'CustomProductRequest',
        relatedId: request._id
      });
      console.log('Notification sent to customer successfully');
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Continue with the response even if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Custom product request accepted successfully',
      request
    });
  } catch (error) {
    console.error('Error accepting custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept custom product request',
      error: error.message
    });
  }
};

// Reject a custom product request
export const rejectCustomRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { shopOwnerNotes } = req.body;
    const userId = req.user._id;

    console.log(`Reject request for ID: ${requestId} from user ID: ${userId}`);

    // Find the request and populate both shop and user
    const request = await CustomProductRequest.findById(requestId)
      .populate({
        path: 'shop',
        select: 'name owner'
      })
      .populate({
        path: 'user',
        select: '_id username email'
      });
      
    if (!request) {
      console.log(`Request with ID ${requestId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Custom product request not found'
      });
    }

    console.log(`Found request: ${JSON.stringify(request)}`);

    // Check if user is the shop owner
    const shopOwnerId = typeof request.shop.owner === 'object' 
      ? request.shop.owner._id 
      : request.shop.owner;
    
    console.log(`Shop owner ID: ${shopOwnerId}, User ID: ${userId}`);
    
    if (shopOwnerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only shop owner can reject this request'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status}`
      });
    }

    // Update the request
    request.status = 'rejected';
    request.shopOwnerNotes = shopOwnerNotes || '';
    await request.save();

    console.log('Request updated successfully');

    // Send notification to user
    try {
      // Get the customer ID (the user who made the request)
      const customerId = request.user._id;
      console.log('Sending notification to customer with ID:', customerId);

      await createNotification({
        recipient: customerId,
        type: 'custom_product_rejected',
        title: 'Custom Product Request Rejected',
        content: `Your custom product request for ${request.shop.name} has been rejected`,
        relatedModel: 'CustomProductRequest',
        relatedId: request._id
      });
      console.log('Notification sent to customer successfully');
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Continue with the response even if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Custom product request rejected successfully',
      request
    });
  } catch (error) {
    console.error('Error rejecting custom request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject custom product request',
      error: error.message
    });
  }
};