const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const authorize = require('../middleware/auth');

// POST /api/reservations/create - Create a new reservation
router.post('/create', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { productId, quantity = 1, startDate, endDate, expirationMinutes = 15 } = req.body;
    const customerId = req.user.id;

    if (!productId || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Product ID, start date, and end date are required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    if (start < now) {
      return res.status(400).json({
        message: 'Start date cannot be in the past'
      });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Check if user already has an active reservation for this product
    const existingReservation = await Reservation.findOne({
      customer: customerId,
      product: productId,
      status: 'active',
      expiresAt: { $gt: now }
    });

    if (existingReservation) {
      return res.status(409).json({
        message: 'You already have an active reservation for this product',
        existingReservation: existingReservation
      });
    }

    // Create reservation using product method
    const reservation = await product.createReservation(
      customerId,
      { startDate: start, endDate: end },
      quantity,
      expirationMinutes
    );

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('product', 'name productImageUrl price')
      .populate('customer', 'firstName lastName email');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: populatedReservation,
      expiresIn: Math.ceil((reservation.expiresAt - now) / 1000) // seconds
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      message: error.message || 'Server error creating reservation'
    });
  }
});

// PUT /api/reservations/:id/extend - Extend reservation time
router.put('/:id/extend', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { additionalMinutes = 15 } = req.body;
    const reservationId = req.params.id;
    const userId = req.user.id;

    const reservation = await Reservation.findById(reservationId)
      .populate('product', 'name')
      .populate('customer', 'firstName lastName');

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found'
      });
    }

    // Check ownership (customers can only extend their own reservations)
    if (req.user.role === 'customer' && reservation.customer._id.toString() !== userId) {
      return res.status(403).json({
        message: 'You can only extend your own reservations'
      });
    }

    if (!reservation.isValid()) {
      return res.status(400).json({
        message: 'Cannot extend expired or inactive reservation'
      });
    }

    // Extend the reservation
    await reservation.extend(additionalMinutes);

    // Emit real-time update
    const product = await Product.findById(reservation.product._id);
    if (product) {
      product.emitInventoryUpdate();
    }

    res.json({
      message: 'Reservation extended successfully',
      reservation: reservation,
      newExpiryTime: reservation.expiresAt,
      additionalMinutes: additionalMinutes
    });

  } catch (error) {
    console.error('Error extending reservation:', error);
    res.status(500).json({
      message: error.message || 'Server error extending reservation'
    });
  }
});

// DELETE /api/reservations/:id/cancel - Cancel a reservation
router.delete('/:id/cancel', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;

    const reservation = await Reservation.findById(reservationId)
      .populate('product', 'name')
      .populate('customer', 'firstName lastName');

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found'
      });
    }

    // Check ownership (customers can only cancel their own reservations)
    if (req.user.role === 'customer' && reservation.customer._id.toString() !== userId) {
      return res.status(403).json({
        message: 'You can only cancel your own reservations'
      });
    }

    // Update status to cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    // Emit real-time update
    const product = await Product.findById(reservation.product._id);
    if (product) {
      product.emitInventoryUpdate();
    }

    res.json({
      message: 'Reservation cancelled successfully',
      reservation: reservation
    });

  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      message: 'Server error cancelling reservation'
    });
  }
});

// GET /api/reservations/my - Get user's reservations
router.get('/my', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active', limit = 10, page = 1 } = req.query;

    const query = { customer: userId };
    if (status !== 'all') {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('product', 'name productImageUrl price category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations: reservations,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({
      message: 'Server error fetching reservations'
    });
  }
});

// GET /api/reservations/product/:productId - Get reservations for a specific product (Admin)
router.get('/product/:productId', authorize(['staff']), async (req, res) => {
  try {
    const { productId } = req.params;
    const { status = 'active', startDate, endDate } = req.query;

    let query = { product: productId };
    
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query.$or = [
        {
          'rentalPeriod.startDate': { $lte: new Date(endDate) },
          'rentalPeriod.endDate': { $gte: new Date(startDate) }
        }
      ];
    }

    const reservations = await Reservation.find(query)
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      productId: productId,
      reservations: reservations,
      count: reservations.length
    });

  } catch (error) {
    console.error('Error fetching product reservations:', error);
    res.status(500).json({
      message: 'Server error fetching product reservations'
    });
  }
});

// POST /api/reservations/cleanup - Cleanup expired reservations (Admin/System)
router.post('/cleanup', authorize(['staff']), async (req, res) => {
  try {
    const cleanedCount = await Reservation.cleanupExpired();
    
    res.json({
      message: 'Expired reservations cleaned up successfully',
      cleanedCount: cleanedCount
    });

  } catch (error) {
    console.error('Error cleaning up reservations:', error);
    res.status(500).json({
      message: 'Server error cleaning up reservations'
    });
  }
});

// GET /api/reservations/analytics - Get reservation analytics (Admin)
router.get('/analytics', authorize(['staff']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Total reservations by status
    const statusStats = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Most reserved products
    const topProducts = await Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { 
        _id: '$product', 
        totalReservations: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }},
      { $sort: { totalReservations: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' },
      { $project: {
        productName: '$product.name',
        totalReservations: 1,
        totalQuantity: 1
      }}
    ]);

    // Conversion rate (reservations that became orders)
    const totalReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const convertedReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate },
      status: 'converted'
    });

    const conversionRate = totalReservations > 0 
      ? ((convertedReservations / totalReservations) * 100).toFixed(1)
      : 0;

    res.json({
      period: `Last ${days} days`,
      statusStats: statusStats,
      topProducts: topProducts,
      conversionRate: {
        total: totalReservations,
        converted: convertedReservations,
        rate: `${conversionRate}%`
      }
    });

  } catch (error) {
    console.error('Error fetching reservation analytics:', error);
    res.status(500).json({
      message: 'Server error fetching analytics'
    });
  }
});

module.exports = router; 