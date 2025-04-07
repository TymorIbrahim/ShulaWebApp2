const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
