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

    // Build query
    let query = {};

    // Status filter
    if (status && status !== 'all') {
      if (status === 'ongoing') {
        // For ongoing orders, we need to check if they are accepted and currently in rental period
        query.status = 'Accepted';
        // Additional filtering will be done in memory for date checking
      } else {
        query.status = status;
      }
    }

    // Quick filter handling
    if (quickFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (quickFilter) {
        case 'today':
          query.createdAt = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'pending':
          query.status = 'Pending';
          break;
        case 'urgent':
          // Orders that start within 24 hours (if accepted)
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          // This will be filtered in memory after population
          break;
        case 'recent':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.createdAt = { $gte: weekAgo };
          break;
      }
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    let orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone membership')
      .populate('items.product', 'name price productImageUrl')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Apply in-memory filtering for complex conditions
    if (quickFilter === 'ongoing' || status === 'ongoing') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      orders = orders.filter(order => {
        if (order.status !== 'Accepted' || !order.items?.length) return false;
        
        return order.items.some(item => {
          if (!item.rentalPeriod?.startDate || !item.rentalPeriod?.endDate) return false;
          
          const startDate = new Date(item.rentalPeriod.startDate);
          const endDate = new Date(item.rentalPeriod.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          
          return today >= startDate && today <= endDate;
        });
      });
    }

    if (quickFilter === 'urgent') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      
      orders = orders.filter(order => {
        if (!order.items?.length) return false;
        
        return order.items.some(item => {
          if (!item.rentalPeriod?.startDate) return false;
          const startDate = new Date(item.rentalPeriod.startDate);
          return startDate <= tomorrow;
        });
      });
    }

    // Search functionality - search in populated user data and order details
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => {
        // Search in user data
        const userMatch = order.user && (
          order.user.firstName?.toLowerCase().includes(searchLower) ||
          order.user.lastName?.toLowerCase().includes(searchLower) ||
          order.user.email?.toLowerCase().includes(searchLower) ||
          order.user.phone?.includes(search)
        );
        
        // Search in order ID
        const orderIdMatch = order._id.toString().toLowerCase().includes(searchLower);
        
        // Search in customer info if available
        const customerInfoMatch = order.customerInfo && (
          order.customerInfo.firstName?.toLowerCase().includes(searchLower) ||
          order.customerInfo.lastName?.toLowerCase().includes(searchLower) ||
          order.customerInfo.email?.toLowerCase().includes(searchLower) ||
          order.customerInfo.phone?.includes(search) ||
          order.customerInfo.idNumber?.includes(search)
        );
        
        // Search in product names
        const productMatch = order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchLower)
        );
        
        return userMatch || orderIdMatch || customerInfoMatch || productMatch;
      });
    }

    // Recalculate pagination after filtering
    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / limitNum);
    
    // Apply pagination to filtered results
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    orders = orders.slice(startIndex, endIndex);

    // Get enhanced statistics
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
    
    // Basic counts
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const acceptedOrders = await Order.countDocuments({ status: 'Accepted' });
    const rejectedOrders = await Order.countDocuments({ status: 'Rejected' });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });
    
    // Calculate ongoing orders (accepted orders currently in rental period)
    const acceptedOrdersWithItems = await Order.find({ status: 'Accepted' })
      .populate('items')
      .lean();
    
    let ongoingCount = 0;
    acceptedOrdersWithItems.forEach(order => {
      if (order.items?.length) {
        const isOngoing = order.items.some(item => {
          if (!item.rentalPeriod?.startDate || !item.rentalPeriod?.endDate) return false;
          
          const startDate = new Date(item.rentalPeriod.startDate);
          const endDate = new Date(item.rentalPeriod.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          
          return today >= startDate && today <= endDate;
        });
        
        if (isOngoing) ongoingCount++;
      }
    });
    
    // Total items and revenue calculations
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['Accepted', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ]);
    
    const itemsResult = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: null, totalItems: { $sum: 1 } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    const totalItems = itemsResult[0]?.totalItems || 0;
    const avgItemsPerOrder = totalOrders > 0 ? Math.round((totalItems / totalOrders) * 10) / 10 : 0;

    return {
      global: {
        total: totalOrders,
        pending: pendingOrders,
        accepted: acceptedOrders,
        rejected: rejectedOrders,
        ongoing: ongoingCount,
        completed: completedOrders,
        totalItems,
        revenue: totalRevenue,
        avgItemsPerOrder
      },
      tabCounts: {
        all: totalOrders,
        pending: pendingOrders,
        ongoing: ongoingCount,
        accepted: acceptedOrders,
        rejected: rejectedOrders
      }
    };
  } catch (err) {
    console.error('Error calculating enhanced order statistics:', err);
    return {
      global: {
        total: 0, pending: 0, accepted: 0, rejected: 0, ongoing: 0,
        totalItems: 0, revenue: 0, avgItemsPerOrder: 0
      },
      tabCounts: {
        all: 0, pending: 0, ongoing: 0, accepted: 0, rejected: 0
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
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Accepted', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
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