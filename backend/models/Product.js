//backend/models/Products.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  productImageUrl: { type: String, default: "" },
  category: { type: String, default: "Uncategorized" },
  price: { type: Number, required: true },
  sku: { type: String, default: null },
  brand: { type: String, default: "Generic" },
  available: { type: Boolean, default: true },
  inventory: { 
    totalUnits: { type: Number, default: 5, min: 0 },
    reservedUnits: { type: Number, default: 0, min: 0 }, // For future advanced booking
    minStockAlert: { type: Number, default: 1 }, // Alert when units go below this
  },
  specifications: { type: String, default: "" }, // Technical specs, dimensions, etc.
  condition: { 
    type: String, 
    enum: ["Excellent", "Very Good", "Good", "Fair", "Needs Repair"], 
    default: "Excellent" 
  },
  tags: [{ type: String }], // For better categorization and search
  featured: { type: Boolean, default: false }, // For highlighting popular items
  
  // Enhanced tracking for unified booking system
  rentalStats: {
    totalRentals: { type: Number, default: 0 },
    lastRented: { type: Date, default: null },
    popularityScore: { type: Number, default: 0 }, // Calculated field
    averageRentalDuration: { type: Number, default: 0 }, // in days
    customerSatisfactionScore: { type: Number, default: 5, min: 1, max: 5 }
  },
  
  // Communication and booking management
  bookingNotes: { type: String, default: "" }, // Special instructions for this item
  maintenanceStatus: {
    lastMaintenance: { type: Date, default: null },
    nextMaintenance: { type: Date, default: null },
    maintenanceNotes: { type: String, default: "" }
  }
}, { timestamps: true });

// Index for better search performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'inventory.totalUnits': 1 });
ProductSchema.index({ 'rentalStats.popularityScore': -1 });
ProductSchema.index({ 'rentalStats.totalRentals': -1 });

// Virtual for available units (total - reserved)
ProductSchema.virtual('inventory.availableUnits').get(function() {
  return Math.max(0, this.inventory.totalUnits - this.inventory.reservedUnits);
});

// Method to check availability for specific dates (enhanced with reservations)
ProductSchema.methods.getAvailabilityForDates = async function(startDate, endDate) {
  const Order = mongoose.model('Order');
  const Reservation = mongoose.model('Reservation');
  
  // Find overlapping rentals that are accepted
  const overlappingOrders = await Order.find({
    'items.product': this._id,
    status: 'Accepted',
    $or: [
      {
        'items.rentalPeriod.startDate': { $lte: endDate },
        'items.rentalPeriod.endDate': { $gte: startDate }
      }
    ]
  });

  // Find overlapping active reservations
  const overlappingReservations = await Reservation.find({
    product: this._id,
    status: 'active',
    expiresAt: { $gt: new Date() }, // Still valid
    $or: [
      {
        'rentalPeriod.startDate': { $lte: endDate },
        'rentalPeriod.endDate': { $gte: startDate }
      }
    ]
  });

  // Count units rented during this period
  let unitsRented = 0;
  overlappingOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.toString() === this._id.toString()) {
        const itemStart = new Date(item.rentalPeriod.startDate);
        const itemEnd = new Date(item.rentalPeriod.endDate);
        const queryStart = new Date(startDate);
        const queryEnd = new Date(endDate);
        
        // Check if periods overlap
        if (itemStart <= queryEnd && itemEnd >= queryStart) {
          unitsRented += item.quantity || 1;
        }
      }
    });
  });

  // Count units reserved during this period
  let unitsReserved = 0;
  overlappingReservations.forEach(reservation => {
    unitsReserved += reservation.quantity || 1;
  });

  const totalUnavailable = unitsRented + unitsReserved;
  const availableUnits = Math.max(0, this.inventory.totalUnits - totalUnavailable);
  
  return {
    totalUnits: this.inventory.totalUnits,
    rentedUnits: unitsRented,
    reservedUnits: unitsReserved,
    totalUnavailable: totalUnavailable,
    availableUnits: availableUnits,
    isAvailable: availableUnits > 0,
    reservations: overlappingReservations.length
  };
};

// Method to get real-time availability (instant snapshot)
ProductSchema.methods.getRealTimeAvailability = async function() {
  const Order = mongoose.model('Order');
  const Reservation = mongoose.model('Reservation');
  const now = new Date();
  
  // Count units currently rented (orders in progress)
  const currentRentals = await Order.find({
    'items.product': this._id,
    status: 'Accepted',
    'items.rentalPeriod.startDate': { $lte: now },
    'items.rentalPeriod.endDate': { $gte: now }
  });

  // Count active reservations
  const activeReservations = await Reservation.find({
    product: this._id,
    status: 'active',
    expiresAt: { $gt: now }
  });

  let currentlyRented = 0;
  currentRentals.forEach(order => {
    order.items.forEach(item => {
      if (item.product.toString() === this._id.toString()) {
        currentlyRented += item.quantity || 1;
      }
    });
  });

  let currentlyReserved = 0;
  activeReservations.forEach(reservation => {
    currentlyReserved += reservation.quantity || 1;
  });

  const totalUnavailable = currentlyRented + currentlyReserved;
  const availableNow = Math.max(0, this.inventory.totalUnits - totalUnavailable);

  return {
    totalUnits: this.inventory.totalUnits,
    currentlyRented: currentlyRented,
    currentlyReserved: currentlyReserved,
    totalUnavailable: totalUnavailable,
    availableNow: availableNow,
    isAvailable: availableNow > 0,
    lastUpdated: now
  };
};

// Method to create a temporary reservation
ProductSchema.methods.createReservation = async function(customerId, rentalPeriod, quantity = 1, expirationMinutes = 15) {
  const Reservation = mongoose.model('Reservation');
  
  // Check if enough units are available
  const availability = await this.getAvailabilityForDates(
    rentalPeriod.startDate, 
    rentalPeriod.endDate
  );
  
  if (availability.availableUnits < quantity) {
    throw new Error(`Only ${availability.availableUnits} units available for the requested period`);
  }

  // Calculate total price
  const durationDays = Math.ceil(
    (new Date(rentalPeriod.endDate) - new Date(rentalPeriod.startDate)) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = this.price * durationDays * quantity;

  // Create reservation
  const reservation = new Reservation({
    customer: customerId,
    product: this._id,
    quantity: quantity,
    rentalPeriod: rentalPeriod,
    expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000),
    totalPrice: totalPrice
  });

  await reservation.save();
  
  // Emit real-time update (if WebSocket is available)
  this.emitInventoryUpdate();
  
  return reservation;
};

// Method to emit inventory updates (for WebSocket integration)
ProductSchema.methods.emitInventoryUpdate = async function() {
  try {
    // Get current availability
    const availability = await this.getRealTimeAvailability();
    
    // If WebSocket server is available, emit the update
    if (global.io) {
      global.io.emit('inventory-update', {
        productId: this._id,
        productName: this.name,
        availability: availability,
        timestamp: new Date()
      });
    }
    
    // Also emit to product-specific room
    if (global.io) {
      global.io.to(`product-${this._id}`).emit('product-availability-update', {
        productId: this._id,
        availability: availability,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error emitting inventory update:', error);
  }
};

// Method to update inventory
ProductSchema.methods.updateInventory = function(totalUnits) {
  this.inventory.totalUnits = Math.max(0, totalUnits);
  return this.save();
};

// Method to update rental statistics
ProductSchema.methods.updateRentalStats = async function() {
  const Order = mongoose.model('Order');
  
  try {
    // Calculate total rentals
    const totalRentals = await Order.countDocuments({
      'items.product': this._id,
      status: { $in: ['Accepted', 'Completed'] }
    });

    // Get last rental date
    const lastRental = await Order.findOne({
      'items.product': this._id,
      status: { $in: ['Accepted', 'Completed'] }
    }).sort({ createdAt: -1 });

    // Calculate average rental duration
    const rentals = await Order.find({
      'items.product': this._id,
      status: { $in: ['Accepted', 'Completed'] }
    });

    let totalDuration = 0;
    let rentalCount = 0;

    rentals.forEach(order => {
      order.items.forEach(item => {
        if (item.product.toString() === this._id.toString()) {
          const start = new Date(item.rentalPeriod.startDate);
          const end = new Date(item.rentalPeriod.endDate);
          const duration = (end - start) / (1000 * 60 * 60 * 24); // Convert to days
          totalDuration += duration;
          rentalCount++;
        }
      });
    });

    const averageRentalDuration = rentalCount > 0 ? totalDuration / rentalCount : 0;
    
    // Calculate popularity score (simple algorithm based on recent rentals)
    const recentRentals = await Order.countDocuments({
      'items.product': this._id,
      status: { $in: ['Accepted', 'Completed'] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const popularityScore = Math.min(10, recentRentals * 2); // Cap at 10

    // Update the product
    this.rentalStats = {
      totalRentals,
      lastRented: lastRental ? lastRental.createdAt : null,
      popularityScore,
      averageRentalDuration,
      customerSatisfactionScore: this.rentalStats.customerSatisfactionScore || 5
    };

    return this.save();
  } catch (error) {
    console.error('Error updating rental stats:', error);
    throw error;
  }
};

module.exports = mongoose.model("Product", ProductSchema);
// module.exports = Product;
