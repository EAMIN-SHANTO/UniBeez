import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  const cart = this;
  let total = 0;
  
  // Calculate total from all items
  if (cart.items && cart.items.length > 0) {
    total = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
  
  cart.totalAmount = total;
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;