// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const authorize = require('../middleware/auth'); //  Protect these routes

// GET /api/analytics/orders/total - Get total number of orders
router.get('/orders/total', authorize(['staff']), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (err) {
    console.error('Error getting total orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/orders/revenue - Get total revenue
router.get('/orders/revenue', authorize(['staff']), async (req, res) => {
  try {
    //  TODO: Implement revenue calculation (sum order values)
    //  This might involve aggregating data in the database
    res.json({ totalRevenue: 0 }); //  Placeholder
  } catch (err) {
    console.error('Error getting total revenue:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/orders/recent - Get recent orders
router.get('/orders/recent', authorize(['staff']), async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10); //  Get last 10
    res.json(recentOrders);
  } catch (err) {
    console.error('Error getting recent orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/analytics/products/popular - Get most popular products
router.get('/products/popular', authorize(['staff']), async (req, res) => {
  try {
    //  TODO: Implement popular products calculation (aggregate order data)
    res.json([]); //  Placeholder
  } catch (err) {
    console.error('Error getting popular products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;