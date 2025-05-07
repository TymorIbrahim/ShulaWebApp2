// middleware/auth.js
const jwt = require('jsonwebtoken'); // You might use JWTs or sessions for auth
const User = require('../models/user.model');

const authorize = (requiredRoles = []) => {
  return (req, res, next) => {
    req.user = { role: ['staff'] };

    if (requiredRoles.length === 0) {
      return next();
    }

    if (req.user && req.user.role && req.user.role.some(role => requiredRoles.includes(role))) {
      return next();
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  };
};

module.exports = authorize;