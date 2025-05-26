// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authorize = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Extract token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.user.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Set user in request object
      req.user = user;

      // Check roles if required
      if (requiredRoles.length === 0) {
        return next();
      }

      // Check if user has required role
      if (user.role && requiredRoles.includes(user.role)) {
        return next();
      } else {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  };
};

module.exports = authorize;