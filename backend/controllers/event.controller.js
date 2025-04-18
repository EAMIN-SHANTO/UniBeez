import Event from '../models/event.model.js';
import multer from 'multer';
import User from '../models/user.model.js';
import { createEventNotification } from './notification.controller.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    console.log('Getting all events');
    const events = await Event.find()
      .sort({ startDate: 1 })
      .populate('organizer', 'username');
    
    console.log(`Found ${events.length} events`);
    
    res.status(200).json({
      success: true,
      events
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
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
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

    const event = new Event(eventData);
    await event.save();

    // Create notifications for all users
    const users = await User.find({});
    await Promise.all(users.map(user => 
      createEventNotification(user._id, event)
    ));

    res.status(201).json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle current event status
export const toggleCurrentEvent = async (req, res) => {
  try {
    console.log('Toggle request received:', {
      eventId: req.params.eventId,
      user: req.user,
      method: req.method
    });

    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // If trying to set as current, check if any other event is current
    if (event.status !== 'current') {
      const currentEvent = await Event.findOne({ status: 'current' });
      
      if (currentEvent) {
        return res.status(400).json({
          success: false,
          message: 'Another event is already set as current. Please unset it first.'
        });
      }

      event.status = 'current';
    } else {
      event.status = 'upcoming';
    }

    await event.save();

    console.log('Event updated successfully:', {
      id: event._id,
      status: event.status
    });

    return res.status(200).json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Error in toggleCurrentEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    console.log('Update request received:', {
      eventId: req.params.eventId,
      updates: req.body,
      user: req.user
    });

    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update the event fields
    Object.assign(event, req.body);
    await event.save();

    console.log('Event updated successfully:', event);

    return res.status(200).json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Archive/Unarchive event
export const archiveEvent = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Toggle between archived and upcoming
    event.status = event.status === 'archived' ? 'upcoming' : 'archived';
    await event.save();

    return res.status(200).json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Error in archiveEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating event status',
      error: error.message
    });
  }
}; 