const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const authorize = require('../middleware/auth');

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

// GET /api/orders/user/:userId - Get orders for a specific user (Customer access to own orders)
router.get('/user/:userId', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only access their own orders, staff can access any user's orders
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied. Cannot view other users\' orders.' });
    }

    const {
      page = 1,
      limit = 10,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { user: requestedUserId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const orders = await Order.find(query)
      .populate('items.product', 'name price productImageUrl')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/stats/user/:userId - Get order statistics for a user
router.get('/stats/user/:userId', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only access their own stats, staff can access any user's stats
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Calculate user statistics
    const totalOrders = await Order.countDocuments({ user: requestedUserId });
    const pendingOrders = await Order.countDocuments({ user: requestedUserId, status: 'Pending' });
    const acceptedOrders = await Order.countDocuments({ user: requestedUserId, status: 'Accepted' });
    const completedOrders = await Order.countDocuments({ user: requestedUserId, status: 'Completed' });
    const cancelledOrders = await Order.countDocuments({ user: requestedUserId, status: 'Cancelled' });

    // Calculate total spent
    const totalSpentResult = await Order.aggregate([
      { $match: { user: mongoose.Types.ObjectId(requestedUserId), status: { $in: ['Accepted', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ]);
    
    const totalSpent = totalSpentResult[0]?.total || 0;

    res.json({
      totalOrders,
      pendingOrders,
      acceptedOrders,
      completedOrders,
      cancelledOrders,
      totalSpent
    });

  } catch (err) {
    console.error('Error fetching user order statistics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/orders - Create new order (Customer) - Backward compatible
router.post('/', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { items, totalValue, customerInfo, pickupReturn, contract, idUpload, payment } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.product || !item.rentalPeriod) {
        return res.status(400).json({ message: 'Each item must have product and rental period' });
      }

      if (!item.rentalPeriod.startDate || !item.rentalPeriod.endDate) {
        return res.status(400).json({ message: 'Rental period must include start and end dates' });
      }

      // Validate dates
      const startDate = new Date(item.rentalPeriod.startDate);
      const endDate = new Date(item.rentalPeriod.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      if (startDate < new Date()) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }
    }

    // If this is a comprehensive checkout (all fields provided), use them
    if (customerInfo && pickupReturn && contract && idUpload && payment) {
      // Create comprehensive order
      const newOrder = new Order({
        user: userId,
        items,
        status: 'Pending',
        totalValue: totalValue || 0,
        customerInfo,
        pickupReturn,
        contract,
        idUpload,
        payment
      });

      const savedOrder = await newOrder.save();
      await savedOrder.populate('items.product', 'name price productImageUrl');
      await savedOrder.populate('user', 'firstName lastName email');

      return res.status(201).json({
        message: 'Comprehensive order created successfully',
        order: savedOrder
      });
    }

    // Otherwise, create a basic order with default values for backward compatibility
    const newOrder = new Order({
      user: userId,
      items: items.map(item => ({
        product: item.product,
        rentalPeriod: item.rentalPeriod,
        price: item.price || 0
      })),
      status: 'Pending',
      totalValue: totalValue || 0,
      // Provide minimal default values for required fields
      customerInfo: {
        firstName: req.user.firstName || 'Unknown',
        lastName: req.user.lastName || 'Unknown',
        email: req.user.email || 'unknown@example.com',
        phone: req.user.phone || '000-000-0000',
        idNumber: 'PENDING'
      },
      pickupReturn: {
        pickupAddress: 'TBD',
        pickupDate: new Date(),
        pickupTime: '09:00',
        returnAddress: 'TBD',
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        returnTime: '17:00'
      },
      contract: {
        signed: false,
        agreementVersion: '1.0'
      },
      idUpload: {
        uploaded: false
      },
      payment: {
        method: 'cash',
        paymentStatus: 'pending'
      }
    });

    const savedOrder = await newOrder.save();
    
    // Populate the saved order
    await savedOrder.populate('items.product', 'name price productImageUrl');
    await savedOrder.populate('user', 'firstName lastName email');

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });

  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/orders/:id/cancel - Cancel order (Customer can cancel own pending orders)
router.put('/:id/cancel', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can cancel this order
    if (req.user.role !== 'staff' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Cannot cancel this order.' });
    }

    // Only pending orders can be cancelled by customers
    if (req.user.role !== 'staff' && order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Update order status
    order.status = 'Cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/:id - Get single order (Customer can access own orders, staff can access any)
// NOTE: This MUST be last among GET routes because it's the most general pattern
router.get('/:id', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name price description productImageUrl');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order
    if (req.user.role !== 'staff' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Cannot view this order.' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/orders/checkout - Create comprehensive order with all checkout data
router.post('/checkout', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { 
      items, 
      totalValue, 
      customerInfo, 
      pickupReturn, 
      contract, 
      idUpload, 
      payment,
      metadata 
    } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!customerInfo || !pickupReturn || !contract || !idUpload || !payment) {
      return res.status(400).json({ message: 'All checkout sections must be completed' });
    }

    // Validate customer info
    const { firstName, lastName, email, phone, idNumber } = customerInfo;
    if (!firstName || !lastName || !email || !phone || !idNumber) {
      return res.status(400).json({ message: 'All customer information fields are required' });
    }

    // Validate pickup/return details
    const { pickupAddress, pickupDate, pickupTime, returnAddress, returnDate, returnTime } = pickupReturn;
    if (!pickupAddress || !pickupDate || !pickupTime || !returnAddress || !returnDate || !returnTime) {
      return res.status(400).json({ message: 'All pickup and return details are required' });
    }

    // Validate contract signing
    if (!contract.signed || !contract.signatureData || !contract.agreementVersion) {
      return res.status(400).json({ message: 'Contract must be signed with valid signature data' });
    }

    // Validate ID upload
    if (!idUpload.uploaded || !idUpload.fileName || !idUpload.fileUrl) {
      return res.status(400).json({ message: 'Valid ID document must be uploaded' });
    }

    // Validate payment method
    if (!payment.method || !['cash', 'online'].includes(payment.method)) {
      return res.status(400).json({ message: 'Valid payment method must be selected' });
    }

    // For online payments, ensure payment is completed
    if (payment.method === 'online' && payment.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Online payment must be completed before order creation' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.product || !item.rentalPeriod || !item.price) {
        return res.status(400).json({ message: 'Each item must have product, rental period, and price' });
      }

      if (!item.rentalPeriod.startDate || !item.rentalPeriod.endDate) {
        return res.status(400).json({ message: 'Rental period must include start and end dates' });
      }

      // Validate dates
      const startDate = new Date(item.rentalPeriod.startDate);
      const endDate = new Date(item.rentalPeriod.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      if (startDate < new Date()) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }
    }

    // Create comprehensive order
    const newOrder = new Order({
      user: userId,
      items,
      totalValue,
      customerInfo,
      pickupReturn,
      contract: {
        ...contract,
        signedAt: contract.signedAt || new Date()
      },
      idUpload,
      payment: {
        ...payment,
        paymentDate: payment.paymentDate || (payment.paymentStatus === 'completed' ? new Date() : null)
      },
      metadata: {
        ...metadata,
        completedAt: new Date()
      },
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    
    // Populate the saved order with product details
    await savedOrder.populate('items.product', 'name price productImageUrl');
    await savedOrder.populate('user', 'firstName lastName email');

    console.log(`✅ Comprehensive order created: ${savedOrder._id} for user ${savedOrder.user.email}`);

    res.status(201).json({
      message: 'Order created successfully with all checkout data',
      order: savedOrder,
      orderNumber: savedOrder._id.toString().slice(-6).toUpperCase()
    });

  } catch (err) {
    console.error('Error creating comprehensive order:', err);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

module.exports = router; 