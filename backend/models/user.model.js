const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String }, // optional if signing in via Google
    password: { type: String }, // will be undefined for Google users (store hashed password for local sign-up)
    googleId: { type: String, default: null },
    profilePic: { type: String, default: null },
    role: { type: String, enum: ['customer', 'staff'], default: 'customer' },
    signUpMethod: { type: String, enum: ['local', 'google'], default: 'local' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
