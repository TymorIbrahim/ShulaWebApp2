// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authorize = require('../middleware/auth'); //  Import the authorization middleware

// GET /api/users - Get all users (Admin only)
router.get('/', authorize(['staff']), async (req, res) => {
  try {
    const users = await User.find().select('-password'); //  Exclude passwords for security
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:userId - Get a single user by ID (Admin or Manager)
router.get('/:userId', authorize(['staff']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:userId - Update a user (Admin only - for roles, etc.)
router.put('/:userId', authorize(['staff']), async (req, res) => {
  try {
    const { roles, ...updateData } = req.body; //  Separate roles from other updates
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { ...updateData, roles: roles }, //  Update both data and roles
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:userId - Delete a user (Admin only)
router.delete('/:userId', authorize(['staff']), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;