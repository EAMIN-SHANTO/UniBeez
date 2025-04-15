import EventShop from '../models/eventShop.model.js';
import Shop from '../models/shop.model.js';
import Event from '../models/event.model.js';

// Get user's shops
export const getUserShops = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all shops owned by the user
    const shops = await Shop.find({ owner: userId })
      .select('name description logo category');

    res.status(200).json({
      success: true,
      shops
    });
  } catch (error) {
    console.error('Error fetching user shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user shops',
      error: error.message
    });
  }
};

// Register a shop for an event
export const registerEventShop = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { shopId } = req.body; // Now expecting shopId in request body
    const userId = req.user._id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is current
    if (event.status !== 'current') {
      return res.status(400).json({
        success: false,
        message: 'Can only register for current events'
      });
    }

    // Find user's shop
    const shop = await Shop.findOne({ _id: shopId, owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found or you do not own this shop'
      });
    }

    // Check if shop is already registered
    const existingRegistration = await EventShop.findOne({ event: eventId, shop: shop._id });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Shop is already registered for this event'
      });
    }

    // Create new event shop registration
    const eventShop = new EventShop({
      event: eventId,
      shop: shop._id,
      status: 'approved' // Auto-approve for now
    });

    await eventShop.save();

    res.status(201).json({
      success: true,
      message: 'Shop registered for event successfully',
      eventShop
    });
  } catch (error) {
    console.error('Error registering event shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering shop for event',
      error: error.message
    });
  }
};

// Get all shops for an event
export const getEventShops = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get all shops for the event
    const eventShops = await EventShop.find({ event: eventId })
      .populate({
        path: 'shop',
        select: 'name description logo category rating reviewCount'
      });

    res.status(200).json({
      success: true,
      eventShops: eventShops.map(es => es.shop)
    });
  } catch (error) {
    console.error('Error fetching event shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event shops',
      error: error.message
    });
  }
};

// Remove shop from event
export const removeEventShop = async (req, res) => {
  try {
    const { eventId, shopId } = req.params;
    const userId = req.user._id;

    // Find the event shop registration
    const eventShop = await EventShop.findOne({ event: eventId, shop: shopId })
      .populate('shop', 'owner');

    if (!eventShop) {
      return res.status(404).json({
        success: false,
        message: 'Shop is not registered for this event'
      });
    }

    // Check if user is authorized (shop owner or admin/staff)
    if (eventShop.shop.owner.toString() !== userId.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove this shop'
      });
    }

    // Remove the event shop registration
    await EventShop.findByIdAndDelete(eventShop._id);

    res.status(200).json({
      success: true,
      message: 'Shop removed from event successfully'
    });
  } catch (error) {
    console.error('Error removing event shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing shop from event',
      error: error.message
    });
  }
}; 