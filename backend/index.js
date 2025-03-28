import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import connectDB from './lib/connectDB.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 3000;

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working!" });
});

// Auth routes
app.use('/api/auth', authRouter);

// User routes
app.use('/api/users', userRouter);

console.log('Routes registered:');
console.log('- Auth routes: /api/auth');
console.log('- User routes: /api/users');

// Start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
