import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // New fields
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user'
  },
  fullName: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['customer', 'seller'],
    default: 'customer'
  },
  phone: {
    type: String,
    trim: true
  },
  img: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/4908/4908415.png'
  }
}, {
  timestamps: true
});

// Create indexes to ensure uniqueness
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ studentId: 1 }, { sparse: true }); // Sparse index for optional field

const User = mongoose.model("User", userSchema);

export default User; 