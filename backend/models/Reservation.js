const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  rentalPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'converted', 'cancelled'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes default
  },
  reservationNotes: {
    type: String,
    default: ""
  },
  // Tracking fields
  convertedToOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  // Automatically remove expired reservations
  expireAfterSeconds: 0,
  expireAt: "expiresAt"
});

// Indexes for performance
ReservationSchema.index({ customer: 1, status: 1 });
ReservationSchema.index({ product: 1, status: 1 });
ReservationSchema.index({ expiresAt: 1 });
ReservationSchema.index({ 
  'rentalPeriod.startDate': 1, 
  'rentalPeriod.endDate': 1 
});

// Virtual for duration in days
ReservationSchema.virtual('durationDays').get(function() {
  const start = new Date(this.rentalPeriod.startDate);
  const end = new Date(this.rentalPeriod.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Method to check if reservation is still valid
ReservationSchema.methods.isValid = function() {
  return this.status === 'active' && new Date() < this.expiresAt;
};

// Method to extend reservation time
ReservationSchema.methods.extend = function(minutes = 15) {
  if (this.isValid()) {
    this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    return this.save();
  }
  throw new Error('Cannot extend expired or inactive reservation');
};

// Method to convert to order
ReservationSchema.methods.convertToOrder = function(orderId) {
  this.status = 'converted';
  this.convertedToOrderId = orderId;
  return this.save();
};

// Static method to cleanup expired reservations
ReservationSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { 
      status: 'active',
      expiresAt: { $lt: new Date() }
    },
    { 
      status: 'expired' 
    }
  );
  
  return result.modifiedCount;
};

// Static method to get active reservations for a product in date range
ReservationSchema.statics.getActiveReservationsForProduct = async function(productId, startDate, endDate) {
  return this.find({
    product: productId,
    status: 'active',
    $or: [
      {
        'rentalPeriod.startDate': { $lte: endDate },
        'rentalPeriod.endDate': { $gte: startDate }
      }
    ]
  }).populate('customer', 'firstName lastName email');
};

module.exports = mongoose.model('Reservation', ReservationSchema); 