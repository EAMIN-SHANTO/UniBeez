import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  images: {
    type: [String], 
    default: []
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // New discount fields
  discount: {
    isActive: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['none', 'flash_sale', 'voucher'],
      default: 'none'
    },
    value: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }, // Percentage discount
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    voucherCode: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Calculate the discounted price
productSchema.methods.getDiscountedPrice = function() {
  if (!this.discount.isActive) {
    return this.price;
  }
  
  // For flash sale, check if current date is within the sale period
  if (this.discount.type === 'flash_sale') {
    const now = new Date();
    if (now >= this.discount.startDate && now <= this.discount.endDate) {
      return this.price - (this.price * (this.discount.value / 100));
    }
  }
  
  // For voucher, the discount will be applied at checkout
  return this.price;
};

// Check if flash sale is active
productSchema.methods.isFlashSaleActive = function() {
  if (this.discount.type !== 'flash_sale' || !this.discount.isActive) {
    return false;
  }
  
  const now = new Date();
  return now >= this.discount.startDate && now <= this.discount.endDate;
};

const Product = mongoose.model("Product", productSchema);

export default Product;