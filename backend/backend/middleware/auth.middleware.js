import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    console.log('Verifying token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    
    console.log('User authenticated:', {
      id: user._id,
      username: user.username,
      role: user.role
    });
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}; 