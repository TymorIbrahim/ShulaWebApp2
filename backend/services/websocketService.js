const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket info
    this.productWatchers = new Map(); // productId -> Set of userIds
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ["https://shula-rent-project-production.up.railway.app"]
          : ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Make io globally available for Product model
    global.io = this.io;

    this.setupEventHandlers();
    this.startCleanupJobs();

    console.log('🔄 WebSocket service initialized');
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          
          if (!token) {
            socket.emit('auth-error', { message: 'No token provided' });
            return;
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.user.id;
          socket.userRole = decoded.user.role;
          
          // Store connected user
          this.connectedUsers.set(decoded.user.id, {
            socketId: socket.id,
            socket: socket,
            role: decoded.user.role,
            connectedAt: new Date()
          });

          socket.emit('authenticated', { 
            userId: decoded.user.id,
            role: decoded.user.role,
            message: 'Successfully authenticated'
          });

          // Join user-specific room
          socket.join(`user-${decoded.user.id}`);
          
          // If admin, join admin room
          if (decoded.user.role === 'staff') {
            socket.join('admin-room');
          }

          console.log('User authenticated via WebSocket');
        } catch (error) {
          console.error('Authentication error:', error.message);
          socket.emit('auth-error', { message: 'Invalid token' });
        }
      });

      // Handle product watching (for real-time availability)
      socket.on('watch-product', async (data) => {
        try {
          const { productId } = data;
          
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          // Join product-specific room
          socket.join(`product-${productId}`);
          
          // Track watchers
          if (!this.productWatchers.has(productId)) {
            this.productWatchers.set(productId, new Set());
          }
          this.productWatchers.get(productId).add(socket.userId);

          // Send current availability
          const product = await Product.findById(productId);
          if (product) {
            const availability = await product.getRealTimeAvailability();
            socket.emit('product-availability-update', {
              productId: productId,
              availability: availability,
              timestamp: new Date()
            });
          }

          console.log('User started watching product');
        } catch (error) {
          console.error('Error setting up product watch:', error.message);
          socket.emit('error', { message: 'Error setting up product watch' });
        }
      });

      // Handle stop watching product
      socket.on('unwatch-product', (data) => {
        const { productId } = data;
        
        if (socket.userId && this.productWatchers.has(productId)) {
          this.productWatchers.get(productId).delete(socket.userId);
          
          // Remove empty watcher sets
          if (this.productWatchers.get(productId).size === 0) {
            this.productWatchers.delete(productId);
          }
        }

        socket.leave(`product-${productId}`);
        console.log('User stopped watching product');
      });

      // Handle reservation updates
      socket.on('reservation-heartbeat', async (data) => {
        try {
          const { reservationId } = data;
          
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          const reservation = await Reservation.findById(reservationId);
          if (!reservation) {
            socket.emit('reservation-error', { message: 'Reservation not found' });
            return;
          }

          // Check ownership
          if (reservation.customer.toString() !== socket.userId && socket.userRole !== 'staff') {
            socket.emit('reservation-error', { message: 'Not authorized' });
            return;
          }

          // Send reservation status
          socket.emit('reservation-status', {
            reservationId: reservationId,
            status: reservation.status,
            expiresAt: reservation.expiresAt,
            isValid: reservation.isValid(),
            timeRemaining: Math.max(0, reservation.expiresAt - new Date())
          });

        } catch (error) {
          console.error('Error handling reservation heartbeat:', error.message);
          socket.emit('reservation-error', { message: 'Error checking reservation' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected');
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Clean up product watchers
          this.productWatchers.forEach((watchers, productId) => {
            watchers.delete(socket.userId);
            if (watchers.size === 0) {
              this.productWatchers.delete(productId);
            }
          });
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error occurred');
      });
    });
  }

  // Broadcast inventory update to all relevant clients
  broadcastInventoryUpdate(productId, availability) {
    if (!this.io) return;

    // Broadcast to all clients in general inventory room
    this.io.emit('inventory-update', {
      productId: productId,
      availability: availability,
      timestamp: new Date()
    });

    // Broadcast to product-specific watchers
    this.io.to(`product-${productId}`).emit('product-availability-update', {
      productId: productId,
      availability: availability,
      timestamp: new Date()
    });
  }

  // Notify about low stock
  notifyLowStock(product) {
    if (!this.io) return;

    const notification = {
      type: 'low-stock',
      productId: product._id,
      productName: product.name,
      availableUnits: product.inventory.totalUnits,
      minStockAlert: product.inventory.minStockAlert,
      timestamp: new Date()
    };

    // Notify all admin users
    this.io.to('admin-room').emit('low-stock-alert', notification);
  }

  // Notify about reservation expiring soon
  notifyReservationExpiring(reservation, minutesUntilExpiry) {
    if (!this.io) return;

    const notification = {
      type: 'reservation-expiring',
      reservationId: reservation._id,
      productName: reservation.product?.name || 'Unknown Product',
      minutesUntilExpiry: minutesUntilExpiry,
      timestamp: new Date()
    };

    // Notify the specific user
    this.io.to(`user-${reservation.customer}`).emit('reservation-expiring', notification);
  }

  // Send order status update
  notifyOrderUpdate(order, status) {
    if (!this.io) return;

    const notification = {
      type: 'order-update',
      orderId: order._id,
      status: status,
      items: order.items?.map(item => item.product?.name || 'Unknown Product'),
      timestamp: new Date()
    };

    // Notify the customer
    this.io.to(`user-${order.customer}`).emit('order-update', notification);
    
    // Notify admins
    this.io.to('admin-room').emit('admin-order-update', {
      ...notification,
      customerName: order.customerName
    });
  }

  // Start background cleanup jobs
  startCleanupJobs() {
    // Clean up expired reservations every 5 minutes
    setInterval(async () => {
      try {
        const cleanedCount = await Reservation.cleanupExpired();
        if (cleanedCount > 0) {
          console.log(`🧹 Cleaned up ${cleanedCount} expired reservations`);
          
          // Notify admins
          this.io.to('admin-room').emit('reservations-cleaned', {
            count: cleanedCount,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error in reservation cleanup job:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Check for reservations expiring soon (every minute)
    setInterval(async () => {
      try {
        const soonToExpireReservations = await Reservation.find({
          status: 'active',
          expiresAt: {
            $gt: new Date(),
            $lt: new Date(Date.now() + 5 * 60 * 1000) // Next 5 minutes
          }
        }).populate('customer product');

        soonToExpireReservations.forEach(reservation => {
          const minutesUntilExpiry = Math.ceil(
            (reservation.expiresAt - new Date()) / (1000 * 60)
          );
          this.notifyReservationExpiring(reservation, minutesUntilExpiry);
        });
      } catch (error) {
        console.error('Error checking expiring reservations:', error);
      }
    }, 60 * 1000); // 1 minute
  }

  // Get connection statistics
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      productWatchers: this.productWatchers.size,
      totalWatches: Array.from(this.productWatchers.values())
        .reduce((total, watchers) => total + watchers.size, 0)
    };
  }
}

module.exports = new WebSocketService(); 