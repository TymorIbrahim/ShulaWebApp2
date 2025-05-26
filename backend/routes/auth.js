// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/user.model"); // Ensure this path is correct
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, contains letters and numbers
  return password && password.length >= 6 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
};

const validatePhone = (phone) => {
  // Israeli phone number validation (basic)
  const phoneRegex = /^[\+]?[0-9\-\(\)\s]{9,15}$/;
  return phoneRegex.test(phone);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// POST /api/auth/signup - Register a new user
router.post("/signup", async (req, res) => {
  try {
    let { firstName, lastName, email, phone, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Sanitize inputs
    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);
    email = sanitizeInput(email.toLowerCase());
    phone = sanitizeInput(phone);

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters and contain letters and numbers" 
      });
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      signUpMethod: "local",
      role: "customer" // Explicitly set default role
    });

    const savedUser = await newUser.save();
    
    // Remove password from response
    const userResponse = { ...savedUser.toObject() };
    delete userResponse.password;

    res.status(201).json({ 
      message: "User created successfully", 
      user: userResponse 
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login - Log in an existing user
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Sanitize email
    email = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token with shorter expiration for security
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // 24 hours
    );
    
    // Prepare user object to send back (without password)
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    // Send response
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userResponse 
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
