import ServiceRequest from '../models/serviceRequest.model.js';
import Shop from '../models/shop.model.js';
import mongoose from 'mongoose';

// Get all service requests
export const getAllServiceRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find()
      .populate('shopId', 'name logo category');
    
    res.status(200).json({
      success: true,
      count: serviceRequests.length,
      serviceRequests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: error.message
    });
  }
};

export const createServiceRequest = async (req, res) => {
  try {
    const { shopId, serviceType, description } = req.body;

    // Validate required fields
    if (!shopId || !serviceType || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if serviceType is an array and has at least one item
    if (!Array.isArray(serviceType) || serviceType.length === 0) {
      return res.status(400).json({ message: 'At least one service type must be selected.' });
    }

    // Validate shopId format
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: 'Invalid Shop ID format.' });
    }

    // Create a new service request
    const newRequest = new ServiceRequest({ 
      shopId,
      serviceType, 
      description 
    });
    await newRequest.save();

    res.status(201).json({ message: 'Service request created successfully.' });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ message: 'Failed to create service request.', error: error.message });
  }
};

// Get all shops for service request form
export const getShopsForServiceRequest = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'active' })
      .select('_id name logo category')
      .populate('owner', 'username email');
    
    res.status(200).json({
      success: true,
      count: shops.length,
      shops
    });
  } catch (error) {
    console.error('Error fetching shops for service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: error.message
    });
  }
};