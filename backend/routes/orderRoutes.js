const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const authorize = require('../middleware/auth');

// GET /api/orders/availability?productId=... - Enhanced availability with reservations and real-time data
router.get("/availability", async (req, res) => {
  try {
    const { productId, detailed = false } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Get the product to check inventory
    const Product = require("../models/Product");
    const Reservation = require("../models/Reservation");
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (detailed === 'true') {
      // Use new enhanced method that includes reservations
      const currentAvailability = await product.getRealTimeAvailability();
      
      // Get future availability for next 30 days
      const futureAvailability = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayAvailability = await product.getAvailabilityForDates(dateString, dateString);
        
        futureAvailability.push({
          date: dateString,
          ...dayAvailability
        });
      }

      // Get active reservations for this product
      const activeReservations = await Reservation.find({
        product: productId,
        status: 'active',
        expiresAt: { $gt: new Date() }
      }).populate('customer', 'firstName lastName email')
        .sort({ expiresAt: 1 });

      return res.status(200).json({
        productId: productId,
        productName: product.name,
        currentAvailability: currentAvailability,
        futureAvailability: futureAvailability,
        activeReservations: activeReservations,
        inventoryInfo: {
          totalUnits: product.inventory.totalUnits,
          minStockAlert: product.inventory.minStockAlert
        },
        lastUpdated: new Date(),
        message: `Enhanced availability data for product ${product.name}`
      });
    }

    // Legacy format for backward compatibility
    const orders = await Order.find({ 
      status: "Accepted",
      "items.product": productId
    }).lean();

    // Get active reservations
    const activeReservations = await Reservation.find({
      product: productId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).lean();

    // Create a map to track units rented and reserved per date
    const dateAvailability = new Map();

    // Process orders
    orders.forEach((order) => {
      const matchingItems = order.items.filter(item => item.product.toString() === productId);
      
      matchingItems.forEach((item) => {
        if (item.rentalPeriod && item.rentalPeriod.startDate && item.rentalPeriod.endDate) {
          let currentDate = new Date(item.rentalPeriod.startDate);
          const endDate = new Date(item.rentalPeriod.endDate);

          currentDate.setUTCHours(0, 0, 0, 0);
          endDate.setUTCHours(0, 0, 0, 0);

          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            
            if (!dateAvailability.has(dateString)) {
              dateAvailability.set(dateString, { rented: 0, reserved: 0 });
            }
            dateAvailability.get(dateString).rented += (item.quantity || 1);
            
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          }
        }
      });
    });

    // Process reservations
    activeReservations.forEach((reservation) => {
      if (reservation.rentalPeriod && reservation.rentalPeriod.startDate && reservation.rentalPeriod.endDate) {
        let currentDate = new Date(reservation.rentalPeriod.startDate);
        const endDate = new Date(reservation.rentalPeriod.endDate);

        currentDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
          const dateString = currentDate.toISOString().split('T')[0];
          
          if (!dateAvailability.has(dateString)) {
            dateAvailability.set(dateString, { rented: 0, reserved: 0 });
          }
          dateAvailability.get(dateString).reserved += (reservation.quantity || 1);
          
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
      }
    });

    // Convert to array of availability objects
    const availabilityData = [];
    const fullyBookedDates = [];

    dateAvailability.forEach((usage, dateString) => {
      const totalUnavailable = usage.rented + usage.reserved;
      const availableUnits = Math.max(0, product.inventory.totalUnits - totalUnavailable);
      
      availabilityData.push({
        date: dateString,
        totalUnits: product.inventory.totalUnits,
        rentedUnits: usage.rented,
        reservedUnits: usage.reserved,
        totalUnavailable: totalUnavailable,
        availableUnits: availableUnits,
        isAvailable: availableUnits > 0
      });

      if (availableUnits === 0) {
        fullyBookedDates.push(dateString);
      }
    });

    res.status(200).json({
      productId: productId,
      totalInventoryUnits: product.inventory.totalUnits,
      availabilityByDate: availabilityData,
      fullyBookedDates: fullyBookedDates, // For backward compatibility
      hasActiveReservations: activeReservations.length > 0,
      activeReservationsCount: activeReservations.length,
      lastUpdated: new Date(),
      message: `Availability data for product ${product.name}`
    });

  } catch (err) {
    console.error("Error fetching product availability:", err);
    res.status(500).json({ message: "Server error fetching availability" });
  }
});

// GET /api/orders/availability/realtime?productId=... - Real-time availability snapshot
router.get("/availability/realtime", async (req, res) => {
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const Product = require("../models/Product");
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const availability = await product.getRealTimeAvailability();
    
    res.status(200).json({
      productId: productId,
      productName: product.name,
      ...availability
    });

  } catch (err) {
    console.error("Error fetching real-time availability:", err);
    res.status(500).json({ message: "Server error fetching real-time availability" });
  }
});

// POST /api/orders/validate-booking - Enhanced booking validation with reservations
router.post("/validate-booking", async (req, res) => {
  try {
    const { productId, startDate, endDate, quantity = 1, excludeReservationId } = req.body;
    
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Product ID, start date, and end date are required",
        isAvailable: false
      });
    }

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

    // Check availability including reservations
    const availability = await product.getAvailabilityForDates(startDate, endDate);
    
    // If validating for an existing reservation, exclude it from calculations
    if (excludeReservationId) {
      const Reservation = require("../models/Reservation");
      const existingReservation = await Reservation.findById(excludeReservationId);
      if (existingReservation && existingReservation.product.toString() === productId) {
        availability.reservedUnits = Math.max(0, availability.reservedUnits - (existingReservation.quantity || 1));
        availability.totalUnavailable = availability.rentedUnits + availability.reservedUnits;
        availability.availableUnits = Math.max(0, availability.totalUnits - availability.totalUnavailable);
        availability.isAvailable = availability.availableUnits >= quantity;
      }
    }
    
    const hasEnoughUnits = availability.availableUnits >= quantity;
    
    res.status(200).json({
      productId: productId,
      requestedPeriod: { startDate, endDate },
      requestedQuantity: quantity,
      ...availability,
      isAvailable: hasEnoughUnits,
      message: hasEnoughUnits 
        ? `${availability.availableUnits} units available for the requested period (${quantity} requested)`
        : `Not enough units available. Only ${availability.availableUnits} units available (${quantity} requested). ${availability.rentedUnits} rented, ${availability.reservedUnits} reserved.`
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

    // Calculate total spent - Fix mongoose import issue
    const mongoose = require('mongoose');
    const totalSpentResult = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(requestedUserId), status: { $in: ['Accepted', 'Completed'] } } },
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

// POST /api/orders - Create new order (Customer) - Enhanced with comprehensive validation
router.post('/', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { items, totalValue, customerInfo, pickupReturn, contract, idUpload, payment, metadata } = req.body;
    const userId = req.user._id;

    console.log('Order creation request:', { userId, itemsCount: items?.length, hasCustomerInfo: !!customerInfo });

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Order validation failed: No items provided');
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.product) {
        console.error(`Item ${i} validation failed: Missing product`);
        return res.status(400).json({ message: `Item ${i + 1}: Product is required` });
      }

      if (!item.rentalPeriod) {
        console.error(`Item ${i} validation failed: Missing rental period`);
        return res.status(400).json({ message: `Item ${i + 1}: Rental period is required` });
      }

      if (!item.rentalPeriod.startDate || !item.rentalPeriod.endDate) {
        console.error(`Item ${i} validation failed: Missing rental dates`);
        return res.status(400).json({ message: `Item ${i + 1}: Rental period must include start and end dates` });
      }

      // Validate and normalize dates
      let startDate, endDate;
      try {
        startDate = new Date(item.rentalPeriod.startDate);
        endDate = new Date(item.rentalPeriod.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (dateError) {
        console.error(`Item ${i} date validation failed:`, dateError.message);
        return res.status(400).json({ message: `Item ${i + 1}: Invalid date format. Use ISO date format (YYYY-MM-DD)` });
      }
      
      if (startDate >= endDate) {
        console.error(`Item ${i} validation failed: End date not after start date`);
        return res.status(400).json({ message: `Item ${i + 1}: End date must be after start date` });
      }

      // Allow past dates for testing, but warn
      if (startDate < new Date() && process.env.NODE_ENV === 'production') {
        console.warn(`Item ${i}: Start date in the past for production`);
        return res.status(400).json({ message: `Item ${i + 1}: Start date cannot be in the past` });
      }

      // Ensure price is provided and valid
      if (typeof item.price !== 'number' || item.price < 0) {
        console.error(`Item ${i} validation failed: Invalid price`);
        return res.status(400).json({ message: `Item ${i + 1}: Valid price is required` });
      }

      // Normalize the item dates
      items[i].rentalPeriod.startDate = startDate;
      items[i].rentalPeriod.endDate = endDate;
    }

    // Enhanced validation for comprehensive checkout
    if (customerInfo && pickupReturn && contract && idUpload && payment) {
      console.log('Creating comprehensive order with full checkout data');
      
      // Validate customerInfo
      const requiredCustomerFields = ['firstName', 'lastName', 'email', 'phone'];
      for (const field of requiredCustomerFields) {
        if (!customerInfo[field] || customerInfo[field].trim() === '') {
          console.error(`Customer info validation failed: Missing ${field}`);
          return res.status(400).json({ message: `Customer info: ${field} is required` });
        }
      }

      // Validate pickupReturn dates
      if (pickupReturn.pickupDate) {
        try {
          pickupReturn.pickupDate = new Date(pickupReturn.pickupDate);
          if (isNaN(pickupReturn.pickupDate.getTime())) {
            throw new Error('Invalid pickup date');
          }
        } catch (error) {
          console.error('Pickup date validation failed:', error.message);
          return res.status(400).json({ message: 'Invalid pickup date format' });
        }
      }

      if (pickupReturn.returnDate) {
        try {
          pickupReturn.returnDate = new Date(pickupReturn.returnDate);
          if (isNaN(pickupReturn.returnDate.getTime())) {
            throw new Error('Invalid return date');
          }
        } catch (error) {
          console.error('Return date validation failed:', error.message);
          return res.status(400).json({ message: 'Invalid return date format' });
        }
      }

      // Validate contract
      if (!contract.hasOwnProperty('signed')) {
        console.error('Contract validation failed: Missing signed field');
        return res.status(400).json({ message: 'Contract: signed status is required' });
      }

      // Validate idUpload
      if (!idUpload.hasOwnProperty('uploaded')) {
        console.error('ID upload validation failed: Missing uploaded field');
        return res.status(400).json({ message: 'ID Upload: uploaded status is required' });
      }

      // Validate payment
      if (!payment.method || !['cash', 'online'].includes(payment.method)) {
        console.error('Payment validation failed: Invalid method');
        return res.status(400).json({ message: 'Payment: method must be "cash" or "online"' });
      }

      // Create comprehensive order
      const orderData = {
        user: userId,
        items,
        status: 'Pending',
        totalValue: totalValue || 0,
        customerInfo: {
          firstName: customerInfo.firstName.trim(),
          lastName: customerInfo.lastName.trim(),
          email: customerInfo.email.trim().toLowerCase(),
          phone: customerInfo.phone.trim(),
          idNumber: customerInfo.idNumber || 'PENDING'
        },
        pickupReturn: {
          pickupAddress: pickupReturn.pickupAddress || 'TBD',
          pickupDate: pickupReturn.pickupDate || new Date(),
          pickupTime: pickupReturn.pickupTime || '09:00',
          returnAddress: pickupReturn.returnAddress || pickupReturn.pickupAddress || 'TBD',
          returnDate: pickupReturn.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          returnTime: pickupReturn.returnTime || '17:00',
          specialInstructions: pickupReturn.specialInstructions || ''
        },
        contract: {
          signed: contract.signed,
          signatureData: contract.signatureData || null,
          agreementVersion: contract.agreementVersion || '1.0',
          signedAt: contract.signed && contract.signedAt ? new Date(contract.signedAt) : null
        },
        idUpload: {
          uploaded: idUpload.uploaded,
          fileName: idUpload.fileName || '',
          fileUrl: idUpload.fileUrl || ''
        },
        payment: {
          method: payment.method,
          paymentStatus: payment.paymentStatus || 'pending',
          transactionId: payment.transactionId || null,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
          cardData: payment.cardData || null
        },
        metadata: {
          checkoutVersion: metadata?.checkoutVersion || '2.0',
          completedAt: metadata?.completedAt ? new Date(metadata.completedAt) : new Date(),
          ...metadata
        }
      };

      const newOrder = new Order(orderData);
      const savedOrder = await newOrder.save();
      
      await savedOrder.populate('items.product', 'name price productImageUrl');
      await savedOrder.populate('user', 'firstName lastName email');

      console.log('Comprehensive order created successfully:', savedOrder._id);
      return res.status(201).json({
        message: 'Comprehensive order created successfully',
        order: savedOrder
      });
    }

    // Fallback: Create basic order with safe defaults for backward compatibility
    console.log('Creating basic order with default values');
    
    const newOrder = new Order({
      user: userId,
      items: items.map(item => ({
        product: item.product,
        rentalPeriod: {
          startDate: item.rentalPeriod.startDate,
          endDate: item.rentalPeriod.endDate
        },
        price: item.price || 0
      })),
      status: 'Pending',
      totalValue: totalValue || 0,
      // Safe default values for required fields
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
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        returnTime: '17:00',
        specialInstructions: ''
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
      },
      metadata: {
        checkoutVersion: '1.0',
        completedAt: new Date()
      }
    });

    const savedOrder = await newOrder.save();
    
    await savedOrder.populate('items.product', 'name price productImageUrl');
    await savedOrder.populate('user', 'firstName lastName email');

    console.log('Basic order created successfully:', savedOrder._id);
    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });

  } catch (err) {
    console.error('Error creating order:', err);
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: validationErrors,
        error: err.message
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format', 
        details: `Invalid ${err.path}: ${err.value}`,
        error: err.message
      });
    }
    
    res.status(500).json({ 
      message: 'Server error creating order',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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