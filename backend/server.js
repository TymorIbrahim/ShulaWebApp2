require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const connectDB = require('./config/db');

const websocketService = require('./services/websocketService');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminOrderRoutes = require('./routes/adminOrders');
const reservationRoutes = require('./routes/reservationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests for development, 100 for production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV !== 'production' && 
        (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('localhost'))) {
      return true;
    }
    return false;
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 requests for development, 10 for production
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 requests for development, 5 for production
  message: {
    error: 'Too many checkout attempts, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL, 
          'https://shula-webapp-aqkan10fr-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-nhe8my04r-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-p5wxumce3-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-axj1uf7jy-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-plis3hw1h-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-3bd67pbsd-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-gmzc8acmn-tymoribrahims-projects.vercel.app',
          'https://shula-webapp-j4vlf4751-tymoribrahims-projects.vercel.app',
          'https://shula-rent-project-production.up.railway.app',
          'https://shula-webapp-production.vercel.app',
          'https://shula-webapp.vercel.app'
        ].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins exactly
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
      return;
    }
    
    // For production, also allow any Vercel deployment from tymoribrahims-projects
    if (process.env.NODE_ENV === 'production' && origin && 
        (origin.includes('tymoribrahims-projects.vercel.app') || 
         origin.includes('shula-webapp') && origin.includes('.vercel.app'))) {
      console.log(`✅ CORS allowed Vercel deployment: ${origin}`);
      callback(null, true);
      return;
    }
    
    console.log(`❌ CORS blocked origin: ${origin}`);
    console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
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
app.use('/api/reservations', reservationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Health check endpoint - works in all environments
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ Shula API is running successfully",
    status: "healthy",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: "2.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    message: "✅ Shula API is healthy",
    status: "ok",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Test endpoint for rate limiting
app.get("/api/test-rate-limit", (req, res) => {
  res.json({ 
    message: "Rate limit test endpoint",
    timestamp: new Date().toISOString(),
    ip: req.ip 
  });
});

const PORT = parseInt(process.env.PORT, 10) || 5002;

let serverInstance = null;

if (require.main === module) {
  connectDB().then(() => {
    serverInstance = server.listen(PORT, () => {
      console.log(`Backend server started on port ${PORT}`);
      websocketService.initialize(server);
    }).on('error', (err) => {
        console.error('SERVER STARTUP ERROR:', err);
        process.exit(1);
    });
  });
}

module.exports = { app, server, startServer: (port) => {
    return new Promise((resolve, reject) => {
        serverInstance = server.listen(port, () => {
            console.log(`✅ Server is running on port ${port}`);
            resolve(serverInstance);
        }).on('error', (err) => {
            reject(err);
        });
    });
}};

// Initialize WebSocket service
/* This block is redundant and causes the handleUpgrade error. The service is already initialized when the server starts.
try {
  websocketService.initialize(server);
  console.log('🔄 WebSocket service initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize WebSocket service:', error);
}
*/