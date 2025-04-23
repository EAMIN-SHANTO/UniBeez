import mongoose from "mongoose";

const customProductRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  attachmentUrls: {
    type: [String],
    default: []
  },
  expectedDeliveryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  price: {
    type: Number,
    min: 0
  },
  shopOwnerNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const CustomProductRequest = mongoose.model("CustomProductRequest", customProductRequestSchema);

export default CustomProductRequest;