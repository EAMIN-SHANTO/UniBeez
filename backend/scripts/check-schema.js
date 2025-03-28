import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

async function checkSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get a sample user
    const user = await User.findOne();
    console.log('User schema fields:', Object.keys(user._doc));
    console.log('User university field:', user.university);
    
    // Try updating the university field directly
    user.university = 'Test University ' + new Date().toISOString();
    await user.save();
    console.log('Updated user university:', user.university);
    
    // Fetch the user again to verify
    const updatedUser = await User.findById(user._id);
    console.log('Fetched user university after update:', updatedUser.university);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema(); 