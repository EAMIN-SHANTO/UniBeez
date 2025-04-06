import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  bannerImage: {
    type: String,
    required: [true, 'Banner image is required']
  },
  status: {
    type: String,
    enum: ['Available', 'Upcoming', 'Out of Stock'],
    default: 'Available'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;