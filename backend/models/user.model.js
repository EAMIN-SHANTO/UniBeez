import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // New fields
  role: {
    type: String,
    enum: ['user', 'admin', 'staff', 'seller'],
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
    default: 'https://placehold.co/150'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User; 