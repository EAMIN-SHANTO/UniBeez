import mongoose from "mongoose";

const productPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Page title is required'],
    trim: true,
    minlength: [3, 'Page title must be at least 3 characters long']
  },
  description: {
    type: String,
    trim: true
  },
  bannerImage: {
    type: String,
    default: 'https://via.placeholder.com/1200x300'
  },
  filters: {
    category: {
      type: String,
      trim: true
    },
    minPrice: {
      type: Number,
      min: 0
    },
    maxPrice: {
      type: Number,
      min: 0
    },
    sortBy: {
      type: String,
      enum: ['price-asc', 'price-desc', 'rating', 'newest']
    },
    keyword: {
      type: String,
      trim: true
    }
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const ProductPage = mongoose.model("ProductPage", productPageSchema);

export default ProductPage;
