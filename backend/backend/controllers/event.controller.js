import Event from '../models/event.model.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ startDate: 1 })
      .populate('organizer', 'username');
    
    res.status(200).json({
      success: true,
      events: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  try {
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

    const eventData = {
      title: req.body.title,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      location: req.body.location,
      status: req.body.status || 'upcoming',
      bannerImage: `/uploads/events/${req.file.filename}`,
      organizer: req.user._id
    };

    console.log('Creating event with data:', eventData);

    const event = new Event(eventData);
    await event.save();

    console.log('Event created successfully:', event);

    res.status(201).json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
      details: error.stack
    });
  }
}; 