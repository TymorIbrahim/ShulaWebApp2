const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rentalPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  price: { type: Number, required: true }, // Price for this specific item
});

// Customer information schema
const customerInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  idNumber: { type: String, required: true }
}, { _id: false });

// Pickup and return details schema
const pickupReturnSchema = new Schema({
  pickupAddress: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  returnAddress: { type: String, required: true },
  returnDate: { type: Date, required: true },
  returnTime: { type: String, required: true },
  specialInstructions: { type: String, default: "" }
}, { _id: false });

// Contract signing schema
const contractSchema = new Schema({
  signed: { type: Boolean, required: true, default: false },
  signatureData: { type: String }, // Base64 signature image
  agreementVersion: { type: String, required: true },
  signedAt: { type: Date }
}, { _id: false });

// ID upload schema
const idUploadSchema = new Schema({
  uploaded: { type: Boolean, required: true, default: false },
  fileName: { type: String },
  fileUrl: { type: String }
}, { _id: false });

// Payment details schema
const paymentSchema = new Schema({
  method: { 
    type: String, 
    enum: ["cash", "online"], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"], 
    default: "pending" 
  },
  transactionId: { type: String },
  paymentDate: { type: Date },
  cardData: {
    lastFourDigits: { type: String },
    cardName: { type: String }
  }
}, { _id: false });

// NEW: Pickup confirmation schema
const pickupConfirmationSchema = new Schema({
  confirmedAt: { type: Date, required: true },
  confirmedBy: { type: String, required: true }, // Staff member name/ID
  customerPresent: { type: Boolean, required: true, default: true },
  membershipVerified: { type: Boolean, required: true, default: false },
  idVerified: { type: Boolean, required: true, default: false },
  contractSigned: { type: Boolean, required: true, default: false },
  paymentReceived: { type: Boolean, required: true, default: false },
  itemsHandedOut: [{ 
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String },
    condition: { type: String, enum: ["excellent", "good", "fair", "needs_attention"], default: "good" },
    notes: { type: String, default: "" }
  }],
  notes: { type: String, default: "" }
}, { _id: false });

// NEW: Product condition schema for return
const productConditionSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  conditionOnReturn: { 
    type: String, 
    enum: ["excellent", "good", "fair", "damaged", "broken", "missing"], 
    required: true 
  },
  requiresMaintenance: { type: Boolean, default: false },
  requiresRepair: { type: Boolean, default: false },
  isDiscarded: { type: Boolean, default: false },
  maintenanceNotes: { type: String, default: "" },
  repairNotes: { type: String, default: "" },
  discardReason: { type: String, default: "" },
  staffNotes: { type: String, default: "" }
}, { _id: false });

// NEW: Order summary report schema
const orderSummaryReportSchema = new Schema({
  returnConfirmedAt: { type: Date, required: true },
  returnConfirmedBy: { type: String, required: true }, // Staff member name/ID
  
  // Return timing analysis
  returnTiming: {
    type: String,
    enum: ["early", "onTime", "late"],
    required: true
  },
  daysEarlyLate: { type: Number, default: 0 }, // Positive for late, negative for early
  hoursEarlyLate: { type: Number, default: 0 }, // Additional hours beyond days
  
  // Customer behavior
  customerBehavior: {
    punctuality: { type: String, enum: ["excellent", "good", "fair", "poor"], required: true },
    communication: { type: String, enum: ["excellent", "good", "fair", "poor"], required: true },
    productCare: { type: String, enum: ["excellent", "good", "fair", "poor"], required: true },
    compliance: { type: String, enum: ["excellent", "good", "fair", "poor"], required: true }
  },
  
  // Products condition assessment
  productsCondition: [productConditionSchema],
  
  // Overall assessment
  overallExperience: {
    type: String,
    enum: ["excellent", "good", "satisfactory", "problematic", "poor"],
    required: true
  },
  
  // Financial impact
  additionalCharges: {
    lateFees: { type: Number, default: 0 },
    damageFees: { type: Number, default: 0 },
    maintenanceFees: { type: Number, default: 0 },
    replacementFees: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    otherDescription: { type: String, default: "" }
  },
  
  // Recommendations and notes
  futureRecommendations: {
    approveForFutureRentals: { type: Boolean, required: true },
    requiresSpecialAttention: { type: Boolean, default: false },
    recommendedCustomerCategory: { 
      type: String, 
      enum: ["premium", "standard", "cautious", "restricted"], 
      required: true 
    }
  },
  
  // Free text fields
  staffNotes: { type: String, default: "" },
  publicNotes: { type: String, default: "" }, // Notes visible to customer
  internalNotes: { type: String, default: "" }, // Internal staff notes only
  
  // Metadata
  reportGeneratedBy: { type: String, required: true },
  reportVersion: { type: String, default: "1.0" }
}, { _id: false });

// NEW: Return confirmation schema
const returnConfirmationSchema = new Schema({
  returnedAt: { type: Date, required: true },
  returnedBy: { type: String, required: true }, // Staff member name/ID
  allItemsReturned: { type: Boolean, required: true },
  summaryReport: { type: orderSummaryReportSchema, required: true }
}, { _id: false });

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema], // Array of products with their individual rental periods
    status: {
      type: String,
      enum: ["Pending", "Accepted", "PickedUp", "Completed", "Rejected", "Cancelled"],
      default: "Pending",
    },
    totalValue: { type: Number, required: true },
    
    // Comprehensive checkout data - optional for backward compatibility
    customerInfo: { type: customerInfoSchema, required: false },
    pickupReturn: { type: pickupReturnSchema, required: false },
    contract: { type: contractSchema, required: false },
    idUpload: { type: idUploadSchema, required: false },
    payment: { type: paymentSchema, required: false },
    
    // NEW: Pickup/Return tracking
    pickupConfirmation: { type: pickupConfirmationSchema, required: false },
    returnConfirmation: { type: returnConfirmationSchema, required: false },
    
    // Metadata
    metadata: {
      checkoutVersion: { type: String, default: "1.0" },
      completedAt: { type: Date },
      lastStatusChange: { type: Date, default: Date.now },
      statusHistory: [{
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, required: true },
        notes: { type: String, default: "" }
      }]
    }
  },
  { timestamps: true }
);

// Middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.metadata.lastStatusChange = new Date();
    
    // Add to status history if not already there
    const latestHistory = this.metadata.statusHistory[this.metadata.statusHistory.length - 1];
    if (!latestHistory || latestHistory.status !== this.status) {
      this.metadata.statusHistory.push({
        status: this.status,
        changedAt: new Date(),
        changedBy: "system", // This should be set by the route handler
        notes: ""
      });
    }
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
