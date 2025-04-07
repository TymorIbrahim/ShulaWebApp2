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
    const orders = await Order.find({ product: productId, status: "Accepted" });
    const bookedDates = [];

    orders.forEach((order) => {
      let currentDate = new Date(order.rentalPeriod.startDate);
      const endDate = new Date(order.rentalPeriod.endDate);
      while (currentDate <= endDate) {
        if ([0, 2, 4].includes(currentDate.getDay())) {
          bookedDates.push(currentDate.toISOString());
        }
        currentDate.setDate(currentDate.getDate() + 2);
      }
    });

    res.status(200).json(bookedDates);
  } catch (err) {
    console.error("Error fetching booked dates:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
