//C:\Users\User\ShulaWebApp2\backend\routes\cartRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/order.model");
const authorize = require("../middleware/auth"); // Import auth middleware

// Middleware to validate user ownership of cart items
const validateCartOwnership = async (req, res, next) => {
  try {
    const cartItemId = req.params.cartItemId;
    const userId = req.user._id.toString();
    
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    if (cartItem.user.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. Not your cart item." });
    }
    
    next();
  } catch (err) {
    console.error("Error validating cart ownership:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/carts/:userId - Get all cart items for a user (Protected)
router.get("/:userId", authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only access their own cart, staff can access any cart
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: "Access denied. Cannot view other users' carts." });
    }

    const cartItems = await Cart.find({ user: requestedUserId }).populate("product");
    res.status(200).json(cartItems);
  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/carts/add - Add a new item to the cart (Protected)
router.post("/add", authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { product, rentalPeriod, quantity = 1 } = req.body;
    const userId = req.user._id; // Get user ID from authenticated token
    
    // Input validation
    if (!product || !rentalPeriod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    // Validate rental period
    if (!rentalPeriod.startDate || !rentalPeriod.endDate) {
      return res.status(400).json({ message: "Rental period must include start and end dates" });
    }

    // Validate dates
    const startDate = new Date(rentalPeriod.startDate);
    const endDate = new Date(rentalPeriod.endDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    if (startDate < new Date()) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    // Check product availability for the requested quantity
    const Product = require("../models/Product");
    const productData = await Product.findById(product);
    
    if (!productData) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check availability for the requested dates and quantity
    const availability = await productData.getAvailabilityForDates(startDate, endDate);
    
    if (availability.availableUnits < quantity) {
      return res.status(400).json({ 
        message: `Only ${availability.availableUnits} units available for the requested period. You requested ${quantity} units.`,
        availableUnits: availability.availableUnits,
        requestedQuantity: quantity
      });
    }

    // Check if user already has this product in cart for overlapping dates
    const existingCartItem = await Cart.findOne({
      user: userId,
      product: product,
      $or: [
        {
          "rentalPeriod.startDate": { $lte: endDate },
          "rentalPeriod.endDate": { $gte: startDate }
        }
      ]
    });

    if (existingCartItem) {
      return res.status(400).json({ 
        message: "Product already in cart for overlapping dates. Please update the existing cart item instead." 
      });
    }

    const newCartItem = new Cart({
      user: userId,
      product,
      rentalPeriod,
      quantity,
      status: "Pending",
    });

    const savedItem = await newCartItem.save();
    
    // Populate product details before sending response
    await savedItem.populate('product');
    
    res.status(201).json({ 
      message: "Item added to cart", 
      cartItem: savedItem 
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/carts/:cartItemId - Delete a specific cart item (Protected)
router.delete("/:cartItemId", authorize(['customer', 'staff']), validateCartOwnership, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    await Cart.findByIdAndDelete(cartItemId);
    res.status(200).json({ message: "Cart item deleted" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/carts/:cartItemId - Update a specific cart item (Protected)
router.put("/:cartItemId", authorize(['customer', 'staff']), validateCartOwnership, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const updateData = req.body;
    
    // Get the existing cart item
    const existingCartItem = await Cart.findById(cartItemId).populate('product');
    if (!existingCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    // Validate rental period if being updated
    if (updateData.rentalPeriod) {
      const { startDate, endDate } = updateData.rentalPeriod;
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
          return res.status(400).json({ message: "End date must be after start date" });
        }

        if (start < new Date()) {
          return res.status(400).json({ message: "Start date cannot be in the past" });
        }
      }
    }
    
    // Validate quantity if being updated
    if (updateData.quantity !== undefined) {
      if (updateData.quantity < 1 || !Number.isInteger(updateData.quantity)) {
        return res.status(400).json({ message: "Quantity must be a positive integer" });
      }
      
      // Check availability for the new quantity
      const Product = require("../models/Product");
      const productData = await Product.findById(existingCartItem.product._id);
      
      const startDate = updateData.rentalPeriod?.startDate || existingCartItem.rentalPeriod.startDate;
      const endDate = updateData.rentalPeriod?.endDate || existingCartItem.rentalPeriod.endDate;
      
      const availability = await productData.getAvailabilityForDates(
        new Date(startDate),
        new Date(endDate)
      );
      
      if (availability.availableUnits < updateData.quantity) {
        return res.status(400).json({ 
          message: `Only ${availability.availableUnits} units available for the requested period. You requested ${updateData.quantity} units.`,
          availableUnits: availability.availableUnits,
          requestedQuantity: updateData.quantity
        });
      }
    }

    const updatedItem = await Cart.findByIdAndUpdate(cartItemId, updateData, { new: true }).populate('product');
    res.status(200).json({ 
      message: "Cart item updated", 
      cartItem: updatedItem 
    });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/carts/checkout - Checkout the cart (Protected)
router.post("/checkout", authorize(['customer', 'staff']), async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated token
    
    // Find all cart items for the user
    const cartItems = await Cart.find({ user: userId }).populate('product');
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total value
    let totalValue = 0;
    const orderItems = cartItems.map(item => {
      const { startDate, endDate } = item.rentalPeriod;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = (end - start) / 1000 / 3600;
      let periods = Math.max(1, Math.ceil(hours / 48));
      
      // Deduct a period if the end date is a Sunday (day 0)
      if (end.getDay() === 0) {
        periods = Math.max(1, periods - 1);
      }
      
      const itemValue = periods * item.product.price * item.quantity;
      totalValue += itemValue;
      
      return {
        product: item.product._id,
        quantity: item.quantity,
        rentalPeriod: {
          startDate: item.rentalPeriod.startDate,
          endDate: item.rentalPeriod.endDate
        },
        price: itemValue
      };
    });

    // Create order
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      status: "Pending",
      totalValue: totalValue
    });

    const savedOrder = await newOrder.save();

    // Clear the cart for the user
    await Cart.deleteMany({ user: userId });

    res.status(200).json({ 
      message: "Checkout successful", 
      order: savedOrder 
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/carts/clear/:userId - Clear all cart items for a user (Protected)
router.delete("/clear/:userId", authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only clear their own cart, staff can clear any cart
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: "Access denied. Cannot clear other users' carts." });
    }

    const result = await Cart.deleteMany({ user: requestedUserId });
    
    console.log(`✅ Cleared ${result.deletedCount} cart items for user ${requestedUserId}`);
    
    res.status(200).json({ 
      message: "Cart cleared successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
