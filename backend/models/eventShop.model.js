import mongoose from "mongoose";

const eventShopSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});


eventShopSchema.index({ event: 1, shop: 1 }, { unique: true });

const EventShop = mongoose.model("EventShop", eventShopSchema);

export default EventShop; 