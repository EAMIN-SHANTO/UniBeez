import mongoose from "mongoose";

const featureRequestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  durationType: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bKash', 'bank', 'card'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeatureRequest', featureRequestSchema);
