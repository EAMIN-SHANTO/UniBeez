import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import eventRoutes from './routes/event.route.js';
import connectDB from './lib/connectDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure static file serving before routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Test successful!"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
  console.log('Routes registered:');
  console.log('- Auth routes: /api/auth');
  console.log('- User routes: /api/users');
  console.log('- Event routes: /api/events');
  console.log('Available endpoints:');
  console.log('- GET /api/users/all');
  console.log('- PATCH /api/users/:userId/role');
  console.log('- DELETE /api/users/:userId');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
