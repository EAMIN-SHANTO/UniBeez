import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    console.log('Verifying token...');
    console.log('Cookies:', req.cookies);
    
    const token = req.cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Jwt_UniBeez_Spring_2025_key');
    console.log('Token decoded:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found with ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }

    console.log('User authenticated:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
}; 