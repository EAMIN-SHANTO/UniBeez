import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'event', 
      'system', 
      'custom_product_request',
      'custom_product_accepted',
      'custom_product_rejected',
      'service_request',
      'order'
    ],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  modelType: {
    type: String,
    enum: ['Event', 'CustomProductRequest', 'ServiceRequest', 'Order', null],
    default: null
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'modelType'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;