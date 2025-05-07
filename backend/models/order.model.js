import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'], // Added cancelled status
    default: 'processing'
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    email: String
  },
  orderId: {
    type: String,
    required: true
  },
  confirmationId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentDetails: {
    type: Object
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;