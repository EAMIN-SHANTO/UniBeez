import EventShop from '../models/eventShop.model.js';
import Shop from '../models/shop.model.js';
import Event from '../models/event.model.js';

// Register a shop for an event
export const registerEventShop = async (req, res) => {
  try {
    const { eventId } = req.params;
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
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You need to create a shop first'
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