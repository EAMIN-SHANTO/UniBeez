import mongoose from "mongoose";

const shopRatingSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Ensure a user can only rate a shop once
shopRatingSchema.index({ shop: 1, user: 1 }, { unique: true });

const ShopRating = mongoose.model("ShopRating", shopRatingSchema);

export default ShopRating;