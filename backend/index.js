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
import notificationRoutes from './routes/notification.route.js';
import shopRoutes from './routes/shop.route.js';
import productRoutes from './routes/product.route.js';
import productpageroutes from './routes/productpage.route.js';
import cartRoutes from './routes/cart.route.js';
import eventShopRoutes from './routes/eventShop.route.js';
import featureproductsroutes from './routes/featureproducts.route.js';

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
app.use("/api/events-21301429", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productpage", productpageroutes);
app.use("/api/cart", cartRoutes);
app.use('/api/event-shops', eventShopRoutes);
app.use('/api/featureproducts', featureproductsroutes);

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

app.get("/api/event-shops/test", (req, res) => {
  res.json({ message: "Event shop routes are working!" });
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
      console.log('\nRoutes registered:');
      console.log('- Auth routes: /api/auth/*');
      console.log('- User routes: /api/users/*');
      console.log('- Event routes: /api/events-21301429/*');
      console.log('- Notification routes: /api/notifications/*');
      console.log('- Shop routes: /api/shops/*');
      console.log('- Product routes: /api/products/*');
      console.log('- Product page routes: /api/productpage'); 
      console.log('- Cart routes: /api/cart/*');
      console.log('- Event shop routes: /api/event-shops/*');
      
      // Log available endpoints
      console.log('\nEvent endpoints:');
      console.log('GET    /api/events-21301429');
      console.log('POST   /api/events-21301429');
      console.log('PUT    /api/events-21301429/:eventId');
      console.log('DELETE /api/events-21301429/:eventId');
      console.log('PATCH  /api/events-21301429/:eventId/archive');
      console.log('GET    /api/events-21301429/test');
      
      console.log('\nEvent shop endpoints:');
      console.log('POST   /api/event-shops/:eventId/register');
      console.log('GET    /api/event-shops/:eventId/shops');
      console.log('GET    /api/event-shops/test');
      
      console.log('\nNotification endpoints:');
      console.log('GET    /api/notifications');
      console.log('PATCH  /api/notifications/:notificationId/read');
      console.log('PATCH  /api/notifications/read-all');
      console.log('GET    /api/notifications/test');
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
