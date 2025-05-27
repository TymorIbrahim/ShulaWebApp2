const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const authorize = require('../middleware/auth');

// GET /api/admin/orders - Get all orders with filtering and pagination
router.get('/', authorize(['staff']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      quickFilter = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline for better performance
    const pipeline = [];
    
    // Stage 1: Build initial match conditions
    let matchConditions = {};

    // Status filter
    if (status && status !== 'all') {
      if (status === 'ongoing') {
        matchConditions.status = 'PickedUp';
      } else {
        matchConditions.status = status;
      }
    }

    // Quick filter handling - DATABASE LEVEL
    if (quickFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      switch (quickFilter) {
        case 'today':
          matchConditions.createdAt = {
            $gte: today,
            $lt: tomorrow
          };
          break;
        case 'pending':
          matchConditions.status = 'Pending';
          break;
        case 'recent':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchConditions.createdAt = { $gte: weekAgo };
          break;
        case 'ongoing':
          matchConditions.status = 'PickedUp';
          break;
        case 'ready_for_pickup':
          matchConditions.status = 'Accepted';
          break;
        case 'completed_today':
          matchConditions.status = 'Completed';
          matchConditions['metadata.completedAt'] = {
            $gte: today,
            $lt: tomorrow
          };
          break;
        case 'late_returns':
          matchConditions.status = 'Completed';
          matchConditions['returnConfirmation.summaryReport.returnTiming'] = 'late';
          break;
        case 'due_for_return':
          matchConditions.status = 'PickedUp';
          matchConditions['items.rentalPeriod.endDate'] = { $lte: today };
          break;
        case 'urgent':
          matchConditions.status = 'Accepted';
          matchConditions['items.rentalPeriod.startDate'] = { $lte: tomorrow };
          break;
      }
    }

    // Stage 1: Initial match
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 2: Populate user data
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              phone: 1,
              membership: 1
            }
          }
        ]
      }
    });

    // Stage 3: Unwind user (convert array to object)
    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    });

    // Stage 4: Populate product data for items
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
        pipeline: [
          {
            $project: {
              name: 1,
              price: 1,
              productImageUrl: 1
            }
          }
        ]
      }
    });

    // Stage 5: Merge product details back into items
    pipeline.push({
      $addFields: {
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  product: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDetails',
                          cond: { $eq: ['$$this._id', '$$item.product'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    });

    // Stage 6: Remove temporary productDetails field
    pipeline.push({
      $unset: 'productDetails'
    });

    // Stage 7: Search filtering - DATABASE LEVEL
    if (search) {
      const searchRegex = new RegExp(search.split('').join('.*'), 'i'); // Flexible search
      const mongoose = require('mongoose');
      
      pipeline.push({
        $match: {
          $or: [
            { 'user.firstName': searchRegex },
            { 'user.lastName': searchRegex },
            { 'user.email': searchRegex },
            { 'user.phone': searchRegex },
            { 'customerInfo.firstName': searchRegex },
            { 'customerInfo.lastName': searchRegex },
            { 'customerInfo.email': searchRegex },
            { 'customerInfo.phone': searchRegex },
            { 'customerInfo.idNumber': searchRegex },
            { 'items.product.name': searchRegex },
            ...(search.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: new mongoose.Types.ObjectId(search) }] : [])
          ]
        }
      });
    }

    // Stage 8: Count total documents for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    
    // Stage 9: Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortObj });

    // Stage 10: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Execute both pipelines in parallel
    const [ordersResult, countResult] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate(countPipeline)
    ]);

    const orders = ordersResult;
    const totalOrders = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalOrders / limitNum);

    // Get enhanced statistics (cached if possible)
    const statistics = await calculateEnhancedOrderStatistics();

    res.json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        pageSize: limitNum
      },
      statistics
    });

  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced helper function to calculate order statistics
async function calculateEnhancedOrderStatistics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use aggregation pipeline for efficient statistics calculation
    const statisticsResult = await Order.aggregate([
      {
        $facet: {
          // Basic status counts
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          // Revenue calculation
          revenue: [
            {
              $match: {
                status: { $in: ['Accepted', 'PickedUp', 'Completed'] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalValue' }
              }
            }
          ],
          // Items count
          itemsCount: [
            {
              $unwind: '$items'
            },
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 }
              }
            }
          ],
          // Total orders count
          totalCount: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Process results
    const stats = statisticsResult[0];
    
    // Extract status counts
    const statusMap = {};
    stats.statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });
    
    const totalOrders = stats.totalCount[0]?.total || 0;
    const totalRevenue = stats.revenue[0]?.total || 0;
    const totalItems = stats.itemsCount[0]?.totalItems || 0;
    const avgItemsPerOrder = totalOrders > 0 ? Math.round((totalItems / totalOrders) * 10) / 10 : 0;

    return {
      global: {
        total: totalOrders,
        pending: statusMap.Pending || 0,
        accepted: statusMap.Accepted || 0,
        pickedUp: statusMap.PickedUp || 0,
        ongoing: statusMap.PickedUp || 0, // Ongoing = PickedUp
        completed: statusMap.Completed || 0,
        rejected: statusMap.Rejected || 0,
        cancelled: statusMap.Cancelled || 0,
        totalItems,
        revenue: totalRevenue,
        avgItemsPerOrder
      },
      tabCounts: {
        all: totalOrders,
        pending: statusMap.Pending || 0,
        ongoing: statusMap.PickedUp || 0,
        accepted: statusMap.Accepted || 0,
        completed: statusMap.Completed || 0,
        rejected: statusMap.Rejected || 0
      }
    };
  } catch (err) {
    console.error('Error calculating enhanced order statistics:', err);
    return {
      global: {
        total: 0, pending: 0, accepted: 0, pickedUp: 0, ongoing: 0, completed: 0,
        rejected: 0, cancelled: 0, totalItems: 0, revenue: 0, avgItemsPerOrder: 0
      },
      tabCounts: {
        all: 0, pending: 0, ongoing: 0, accepted: 0, completed: 0, rejected: 0
      }
    };
  }
}

// GET /api/admin/orders/:id - Get single order with membership details
router.get('/:id', authorize(['staff']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone membership')
      .populate('items.product', 'name price description productImageUrl');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/orders/:id - Update order status
router.put('/:id', authorize(['staff']), async (req, res) => {
  try {
    const { status, changedBy = 'Unknown Staff', notes = '' } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Accepted', 'PickedUp', 'Completed', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    // Get the current order to check for status change
    const currentOrder = await Order.findById(req.params.id).populate('items.product');
    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure all items have the required price field from the populated product data
    currentOrder.items.forEach(item => {
      if (!item.price && item.product?.price) {
        item.price = item.product.price;
      }
    });

    // Update status history before saving
    if (currentOrder.status !== status) {
      currentOrder.metadata.statusHistory.push({
        status: status,
        changedAt: new Date(),
        changedBy: changedBy,
        notes: notes
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        'metadata.lastStatusChange': new Date(),
        'metadata.statusHistory': currentOrder.metadata.statusHistory
      },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('items.product', 'name');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order status is changed to "Completed", update rental statistics for all products
    if (status === 'Completed' && currentOrder.status !== 'Completed') {
      console.log(`📊 Order ${updatedOrder._id} completed - updating rental statistics for ${currentOrder.items.length} products`);
      
      // Update rental statistics for each product in the order
      for (const item of currentOrder.items) {
        if (item.product) {
          try {
            await item.product.updateRentalStats();
            console.log(`✅ Updated rental stats for product: ${item.product.name}`);
          } catch (statsError) {
            console.error(`❌ Error updating stats for product ${item.product._id}:`, statsError);
            // Continue with other products even if one fails
          }
        }
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: POST /api/admin/orders/:id/confirm-pickup - Confirm order pickup
router.post('/:id/confirm-pickup', authorize(['staff']), async (req, res) => {
  try {
    const { 
      confirmedBy,
      membershipVerified,
      idVerified,
      contractSigned,
      paymentReceived,
      itemsHandedOut,
      notes = ''
    } = req.body;

    if (!confirmedBy) {
      return res.status(400).json({ message: 'Staff member confirmation required' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone membership')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Accepted') {
      return res.status(400).json({ 
        message: 'Order must be in Accepted status to confirm pickup' 
      });
    }

    // Ensure all items have the required price field from the populated product data
    order.items.forEach(item => {
      if (!item.price && item.product?.price) {
        item.price = item.product.price;
      }
    });

    // Create pickup confirmation data
    const pickupConfirmation = {
      confirmedAt: new Date(),
      confirmedBy,
      customerPresent: true,
      membershipVerified: membershipVerified || false,
      idVerified: idVerified || false,
      contractSigned: contractSigned || false,
      paymentReceived: paymentReceived || false,
      itemsHandedOut: itemsHandedOut || order.items.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        condition: 'good',
        notes: ''
      })),
      notes
    };

    // Update order with pickup confirmation and change status to PickedUp
    order.status = 'PickedUp';
    order.pickupConfirmation = pickupConfirmation;
    
    // Add to status history
    order.metadata.statusHistory.push({
      status: 'PickedUp',
      changedAt: new Date(),
      changedBy: confirmedBy,
      notes: `Pickup confirmed - ${notes}`
    });

    await order.save();

    res.json({
      message: 'Pickup confirmed successfully',
      order: await Order.findById(order._id)
        .populate('user', 'firstName lastName email phone membership')
        .populate('items.product', 'name price productImageUrl')
    });

  } catch (err) {
    console.error('Error confirming pickup:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: POST /api/admin/orders/:id/confirm-return - Confirm order return with summary report
router.post('/:id/confirm-return', authorize(['staff']), async (req, res) => {
  try {
    const { 
      returnedBy,
      summaryReport
    } = req.body;

    if (!returnedBy || !summaryReport) {
      return res.status(400).json({ 
        message: 'Staff member confirmation and summary report required' 
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone membership')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PickedUp') {
      return res.status(400).json({ 
        message: 'Order must be in PickedUp status to confirm return' 
      });
    }

    // Ensure all items have the required price field from the populated product data
    order.items.forEach(item => {
      if (!item.price && item.product?.price) {
        item.price = item.product.price;
      }
    });

    // Calculate return timing
    const expectedReturnDate = new Date(Math.max(...order.items.map(item => new Date(item.rentalPeriod.endDate))));
    const actualReturnDate = new Date();
    const timeDiffMs = actualReturnDate - expectedReturnDate;
    const daysDiff = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.floor((timeDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let returnTiming = 'onTime';
    if (daysDiff > 0 || (daysDiff === 0 && hoursDiff > 2)) {
      returnTiming = 'late';
    } else if (daysDiff < -1 || (daysDiff === -1 && hoursDiff < -2)) {
      returnTiming = 'early';
    }

    // Enhance summary report with calculated data
    const enhancedSummaryReport = {
      ...summaryReport,
      returnConfirmedAt: new Date(),
      returnConfirmedBy: returnedBy,
      returnTiming,
      daysEarlyLate: daysDiff,
      hoursEarlyLate: hoursDiff,
      reportGeneratedBy: returnedBy,
      reportVersion: "1.0"
    };

    // Create return confirmation data
    const returnConfirmation = {
      returnedAt: new Date(),
      returnedBy,
      allItemsReturned: summaryReport.productsCondition?.every(p => p.conditionOnReturn !== 'missing') || true,
      summaryReport: enhancedSummaryReport
    };

    // Update order with return confirmation and change status to Completed
    order.status = 'Completed';
    order.returnConfirmation = returnConfirmation;
    order.metadata.completedAt = new Date();
    
    // Add to status history
    order.metadata.statusHistory.push({
      status: 'Completed',
      changedAt: new Date(),
      changedBy: returnedBy,
      notes: `Return confirmed - ${summaryReport.staffNotes || 'Order completed'}`
    });

    await order.save();

    res.json({
      message: 'Return confirmed successfully',
      order: await Order.findById(order._id)
        .populate('user', 'firstName lastName email phone membership')
        .populate('items.product', 'name price productImageUrl')
    });

  } catch (err) {
    console.error('Error confirming return:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// NEW: GET /api/admin/orders/:id/summary-report - Get order summary report
router.get('/:id/summary-report', authorize(['staff']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name price')
      .select('returnConfirmation items totalValue createdAt');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnConfirmation?.summaryReport) {
      return res.status(404).json({ message: 'Summary report not found' });
    }

    res.json({
      order: {
        _id: order._id,
        user: order.user,
        items: order.items,
        totalValue: order.totalValue,
        createdAt: order.createdAt
      },
      summaryReport: order.returnConfirmation.summaryReport
    });

  } catch (err) {
    console.error('Error fetching summary report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/orders/:id - Delete order
router.delete('/:id', authorize(['staff']), async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 