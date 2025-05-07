//C:\Users\User\ShulaWebApp2\backend\routes\orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");

// POST /api/orders - Create a new order
router.post("/", async (req, res) => {
  try {
    const { user, product, rentalPeriod } = req.body;
    if (!user || !product || !rentalPeriod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      user,
      product,
      rentalPeriod,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();
    
     //  --- LOGGING FOR ANALYTICS ---
     console.log("Order Created:", {
      orderId: savedOrder._id,
      userId: savedOrder.user,
      productId: savedOrder.product,
      orderValue: 0, //  TODO: Calculate order value
      createdAt: savedOrder.createdAt,
    });
    //  --- END LOGGING ---

    res.status(201).json({ message: "Order created successfully", order: savedOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/booked-dates?productId=... - Get booked dates for a product
router.get("/booked-dates", async (req, res) => {
  try {
    const { productId } = req.query;
    // Find orders that are confirmed (e.g., "Accepted" or similar status)
    const orders = await Order.find({ 
        product: productId, 
        status: "Accepted" // Adjust statuses as needed
    }).lean(); // Use .lean() for plain JS objects if not modifying

    const bookedDatesSet = new Set(); // Use a Set to avoid duplicate dates

    orders.forEach((order) => {
      if (order.rentalPeriod && order.rentalPeriod.startDate && order.rentalPeriod.endDate) {
          let currentDate = new Date(order.rentalPeriod.startDate);
          const endDate = new Date(order.rentalPeriod.endDate);

          // Ensure dates are treated as UTC midnight to avoid timezone issues in comparison
          currentDate.setUTCHours(0, 0, 0, 0);
          endDate.setUTCHours(0, 0, 0, 0);

          // Loop through EACH day in the rental period
          while (currentDate <= endDate) {
            // Add the date part (YYYY-MM-DD) to the set
            bookedDatesSet.add(currentDate.toISOString().split('T')[0]); 
            
            // Increment by ONE day
            currentDate.setUTCDate(currentDate.getUTCDate() + 1); 
          }
      } else {
          console.warn(`Order ${order._id} skipped due to missing rentalPeriod data.`);
      }
    });

    // Convert the Set back to an array
    const bookedDatesArray = Array.from(bookedDatesSet); 

    res.status(200).json(bookedDatesArray); // Send array of YYYY-MM-DD strings
  } catch (err) {
    console.error("Error fetching booked dates:", err);
    res.status(500).json({ message: "Server error fetching booked dates" });
  }
});

module.exports = router;
