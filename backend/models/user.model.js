const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Membership schema for community membership tracking
const membershipSchema = new Schema({
  isMember: { type: Boolean, default: false },
  membershipType: { 
    type: String, 
    enum: ["none", "online", "in_person"], 
    default: "none" 
  },
  membershipDate: { type: Date },
  
  // Contract details
  contract: {
    signed: { type: Boolean, default: false },
    signatureData: { type: String }, // Base64 signature image
    agreementVersion: { type: String },
    signedAt: { type: Date },
    signedOnline: { type: Boolean, default: false }
  },
  
  // ID verification
  idVerification: {
    verified: { type: Boolean, default: false },
    fileName: { type: String },
    fileUrl: { type: String },
    uploadedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Staff member who verified
    verifiedAt: { type: Date },
    notes: { type: String } // Admin notes about verification
  },
  
  // Additional info for in-person membership
  inPersonDetails: {
    processedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Staff member who processed
    processedAt: { type: Date },
    location: { type: String }, // Where it was processed
    notes: { type: String }
  }
}, { _id: false });

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // In production, make sure to hash this!
    googleId: { type: String, default: null },
    profilePic: { type: String, default: null },
    role: { type: String, enum: ["customer", "staff"], default: "customer" },
    signUpMethod: { type: String, enum: ["local", "google"], default: "local" },
    
    // Community membership information
    membership: { type: membershipSchema, default: () => ({}) }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
