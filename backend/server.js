const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("./config/db"); // Auto-connects to database
const rateLimit = require('express-rate-limit');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminOrderRoutes = require('./routes/adminOrders');

const app = express();

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 checkout requests per minute
  message: {
    error: 'Too many checkout attempts, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL, 
          'https://shula-webapp-aqkan10fr-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-nhe8my04r-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app',
          'https://shula-rent-project-production.up.railway.app',
          'https://shula-webapp-production.vercel.app',
          'https://shula-webapp.vercel.app'
        ].filter(Boolean) // Remove any undefined values
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(cors(corsOptions));

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/orders/checkout', checkoutLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/carts", cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

// Static folder for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  // Serve the React build files
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  
  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
} else {
  // Default route for development testing
  app.get("/", (req, res) => {
    res.send("✅ Shula API is running...");
  });
}

// Test endpoint for rate limiting
app.get("/api/test-rate-limit", (req, res) => {
  res.json({ 
    message: "Rate limit test endpoint",
    timestamp: new Date().toISOString(),
    ip: req.ip 
  });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Production mode: Serving React build files');
  }
});
