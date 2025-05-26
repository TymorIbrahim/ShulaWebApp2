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
}, { timestamps: true });

// Index for better search performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'inventory.totalUnits': 1 });

// Virtual for available units (total - reserved)
ProductSchema.virtual('inventory.availableUnits').get(function() {
  return Math.max(0, this.inventory.totalUnits - this.inventory.reservedUnits);
});

// Method to check availability for specific dates
ProductSchema.methods.getAvailabilityForDates = async function(startDate, endDate) {
  const Order = mongoose.model('Order');
  
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
          unitsRented++;
        }
      }
    });
  });

  const availableUnits = Math.max(0, this.inventory.totalUnits - unitsRented);
  
  return {
    totalUnits: this.inventory.totalUnits,
    rentedUnits: unitsRented,
    availableUnits: availableUnits,
    isAvailable: availableUnits > 0
  };
};

// Method to update inventory
ProductSchema.methods.updateInventory = function(totalUnits) {
  this.inventory.totalUnits = Math.max(0, totalUnits);
  return this.save();
};

module.exports = mongoose.model("Product", ProductSchema);
// module.exports = Product;
