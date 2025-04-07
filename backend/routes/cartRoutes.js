const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/order.model");

// GET /api/carts/:userId - Get all cart items for a user
router.get("/:userId", async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.params.userId }).populate("product");
    res.status(200).json(cartItems);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/carts/add - Add a new item to the cart
router.post("/add", async (req, res) => {
  try {
    const { user, product, rentalPeriod } = req.body;
    if (!user || !product || !rentalPeriod) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newCartItem = new Cart({
      user,
      product,
      rentalPeriod,
      status: "Pending",
    });
    const savedItem = await newCartItem.save();
    res.status(201).json({ message: "Item added to cart", cartItem: savedItem });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/carts/:cartItemId - Delete a specific cart item
router.delete("/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    await Cart.findByIdAndDelete(cartItemId);
    res.status(200).json({ message: "Cart item deleted" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/carts/:cartItemId - Update a specific cart item (e.g., rental period)
router.put("/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const updateData = req.body;
    const updatedItem = await Cart.findByIdAndUpdate(cartItemId, updateData, { new: true });
    res.status(200).json({ message: "Cart item updated", cartItem: updatedItem });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/carts/checkout - Checkout the cart: move cart items to orders and clear the cart
router.post("/checkout", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ message: "User id required" });
    }
    // Find all cart items for the user
    const cartItems = await Cart.find({ user });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Create orders from cart items
    const orders = [];
    for (const item of cartItems) {
      const newOrder = new Order({
        user: item.user,
        product: item.product,
        rentalPeriod: item.rentalPeriod,
        status: "Pending",
      });
      const savedOrder = await newOrder.save();
      orders.push(savedOrder);
    }

    // Clear the cart for the user
    await Cart.deleteMany({ user });

    res.status(200).json({ message: "Checkout successful", orders });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
