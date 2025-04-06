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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add debug logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Configure static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/api/notifications/test", (req, res) => {
  res.json({ message: "Notification routes are working!" });
});

app.get("/api/events-21301429/test", (req, res) => {
  res.json({ message: "Event routes are working!" });
});

// Error handling
app.use((req, res, next) => {
  console.log('404 hit for:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Routes registered:');
      console.log('- Auth routes: /api/auth');
      console.log('- User routes: /api/users');
      console.log('- Event routes: /api/events');
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
