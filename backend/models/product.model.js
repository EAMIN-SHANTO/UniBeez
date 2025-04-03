import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String,
    required: true
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
});

const Product  = mongoose.model('Product', productSchema);
export default Product 