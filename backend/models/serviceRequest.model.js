import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  serviceType: { type: [String], required: true }, // Changed from String to [String] to store multiple services
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);