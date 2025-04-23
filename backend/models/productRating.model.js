import mongoose from "mongoose";

const productRatingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure a user can only rate a product once
productRatingSchema.index({ product: 1, user: 1 }, { unique: true });

const ProductRating = mongoose.model("ProductRating", productRatingSchema);

export default ProductRating;