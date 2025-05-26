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

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema], // Array of products with their individual rental periods
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },
    totalValue: { type: Number, required: true },
    
    // Comprehensive checkout data - optional for backward compatibility
    customerInfo: { type: customerInfoSchema, required: false },
    pickupReturn: { type: pickupReturnSchema, required: false },
    contract: { type: contractSchema, required: false },
    idUpload: { type: idUploadSchema, required: false },
    payment: { type: paymentSchema, required: false },
    
    // Metadata
    metadata: {
      checkoutVersion: { type: String, default: "1.0" },
      completedAt: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
