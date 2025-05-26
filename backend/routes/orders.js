//C:\Users\User\ShulaWebApp2\backend\routes\orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");

// POST /api/orders - Create a new order (updated for new structure)
router.post("/", async (req, res) => {
  try {
    const { user, items } = req.body;
    if (!user || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: user and items array" });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.product || !item.rentalPeriod || !item.rentalPeriod.startDate || !item.rentalPeriod.endDate) {
        return res.status(400).json({ message: "Each item must have product and rentalPeriod with startDate and endDate" });
      }
    }

    const newOrder = new Order({
      user,
      items,
      status: "Pending",
      totalValue: 0 // TODO: Calculate based on products and rental periods
    });

    const savedOrder = await newOrder.save();
    
     //  --- LOGGING FOR ANALYTICS ---
     console.log("Order Created:", {
      orderId: savedOrder._id,
      userId: savedOrder.user,
      itemsCount: savedOrder.items.length,
      orderValue: savedOrder.totalValue,
      createdAt: savedOrder.createdAt,
    });
    //  --- END LOGGING ---

    res.status(201).json({ message: "Order created successfully", order: savedOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/availability?productId=... - Get availability info for a product (updated for inventory awareness)
router.get("/availability", async (req, res) => {
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Get the product to check inventory
    const Product = require("../models/Product");
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find all accepted orders for this product
    const orders = await Order.find({ 
      status: "Accepted",
      "items.product": productId
    }).lean();

    // Create a map to track units rented per date
    const dateAvailability = new Map();

    orders.forEach((order) => {
      // Find items in this order that match the product
      const matchingItems = order.items.filter(item => item.product.toString() === productId);
      
      matchingItems.forEach((item) => {
        if (item.rentalPeriod && item.rentalPeriod.startDate && item.rentalPeriod.endDate) {
          let currentDate = new Date(item.rentalPeriod.startDate);
          const endDate = new Date(item.rentalPeriod.endDate);

          // Ensure dates are treated as UTC midnight
          currentDate.setUTCHours(0, 0, 0, 0);
          endDate.setUTCHours(0, 0, 0, 0);

          // Loop through each day in the rental period
          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            // Increment the count of rented units for this date
            if (!dateAvailability.has(dateString)) {
              dateAvailability.set(dateString, 0);
            }
            dateAvailability.set(dateString, dateAvailability.get(dateString) + 1);
            
            // Increment by one day
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          }
        }
      });
    });

    // Convert to array of availability objects
    const availabilityData = [];
    const fullyBookedDates = [];

    dateAvailability.forEach((rentedUnits, dateString) => {
      const availableUnits = Math.max(0, product.inventory.totalUnits - rentedUnits);
      
      availabilityData.push({
        date: dateString,
        totalUnits: product.inventory.totalUnits,
        rentedUnits: rentedUnits,
        availableUnits: availableUnits,
        isAvailable: availableUnits > 0
      });

      // If no units available, add to fully booked dates for backward compatibility
      if (availableUnits === 0) {
        fullyBookedDates.push(dateString);
      }
    });

    res.status(200).json({
      productId: productId,
      totalInventoryUnits: product.inventory.totalUnits,
      availabilityByDate: availabilityData,
      fullyBookedDates: fullyBookedDates, // For backward compatibility
      message: `Availability data for product ${product.name}`
    });

  } catch (err) {
    console.error("Error fetching product availability:", err);
    res.status(500).json({ message: "Server error fetching availability" });
  }
});

// POST /api/orders/validate-booking - Validate if a booking is possible for specific dates
router.post("/validate-booking", async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;
    
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Product ID, start date, and end date are required",
        isAvailable: false
      });
    }

    // Get the product to check inventory
    const Product = require("../models/Product");
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found",
        isAvailable: false
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ 
        message: "End date must be after start date",
        isAvailable: false
      });
    }

    if (start < new Date()) {
      return res.status(400).json({ 
        message: "Start date cannot be in the past",
        isAvailable: false
      });
    }

    // Check availability for the requested period
    const availability = await product.getAvailabilityForDates(startDate, endDate);
    
    res.status(200).json({
      productId: productId,
      requestedPeriod: { startDate, endDate },
      ...availability,
      message: availability.isAvailable 
        ? `${availability.availableUnits} units available for the requested period`
        : `No units available. ${availability.rentedUnits} units already rented.`
    });

  } catch (err) {
    console.error("Error validating booking:", err);
    res.status(500).json({ 
      message: "Server error validating booking",
      isAvailable: false
    });
  }
});

module.exports = router;
