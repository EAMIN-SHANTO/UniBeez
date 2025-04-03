import Notification from '../models/notification.model.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  console.log('getUserNotifications called');
  console.log('User:', req.user);
  
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('Found notifications:', notifications.length);

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
};

// Create notification for new event
export const createEventNotification = async (userId, event) => {
  try {
    const notification = new Notification({
      userId,
      title: 'New Event Added',
      message: `A new event "${event.title}" has been added`,
      type: 'event',
      eventId: event._id
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating event notification:', error);
    throw error;
  }
}; 