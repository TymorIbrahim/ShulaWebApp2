// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Order = require('../models/order.model');
const bcrypt = require('bcryptjs');
const authorize = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// GET /api/users - Enhanced with pagination, search, filtering, and statistics
router.get('/', authorize(['staff']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      role = '',
      signUpMethod = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline for better performance
    const pipeline = [];
    
    // Stage 1: Build initial match conditions
    let matchConditions = {};

    // Search functionality - DATABASE LEVEL
    if (search) {
      const searchRegex = new RegExp(search.split('').join('.*'), 'i'); // Flexible search
      matchConditions.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Filter by role
    if (role) {
      matchConditions.role = role;
    }

    // Filter by signup method
    if (signUpMethod) {
      matchConditions.signUpMethod = signUpMethod;
    }

    // Stage 1: Initial match
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 2: Remove password field
    pipeline.push({
      $project: {
        password: 0
      }
    });

    // Stage 3: Count total documents for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    
    // Stage 4: Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortObj });

    // Stage 5: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Execute both pipelines in parallel
    const [usersResult, countResult, statistics, filters] = await Promise.all([
      User.aggregate(pipeline),
      User.aggregate(countPipeline),
      calculateUserStatistics(),
      getFilterOptions()
    ]);

    const users = usersResult;
    const totalUsers = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      },
      statistics,
      filters
    });

  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate user statistics
async function calculateUserStatistics() {
  try {
    // Get recent signups date threshold (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use aggregation pipeline for efficient statistics calculation
    const statisticsResult = await User.aggregate([
      {
        $facet: {
          // Basic counts
          basicCounts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ],
          // Role counts
          roleCounts: [
            {
              $group: {
                _id: '$role',
                count: { $sum: 1 }
              }
            }
          ],
          // Sign up method counts
          signUpMethodCounts: [
            {
              $group: {
                _id: '$signUpMethod',
                count: { $sum: 1 }
              }
            }
          ],
          // Recent signups
          recentSignups: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Process results
    const stats = statisticsResult[0];
    
    const totalUsers = stats.basicCounts[0]?.total || 0;
    
    // Extract role counts
    const roleMap = {};
    stats.roleCounts.forEach(item => {
      roleMap[item._id] = item.count;
    });
    
    // Extract signup method counts
    const signUpMethodMap = {};
    stats.signUpMethodCounts.forEach(item => {
      signUpMethodMap[item._id] = item.count;
    });
    
    const recentSignups = stats.recentSignups[0]?.count || 0;

    return {
      total: totalUsers,
      customers: roleMap.customer || 0,
      staff: roleMap.staff || 0,
      localSignups: signUpMethodMap.local || 0,
      googleSignups: signUpMethodMap.google || 0,
      recentSignups
    };
  } catch (err) {
    console.error('Error calculating user statistics:', err);
    return {
      total: 0,
      customers: 0,
      staff: 0,
      localSignups: 0,
      googleSignups: 0,
      recentSignups: 0
    };
  }
}

// Helper function to get available filter options
async function getFilterOptions() {
  try {
    const roles = await User.distinct('role');
    const signUpMethods = await User.distinct('signUpMethod');
    
    return {
      roles: roles.filter(Boolean),
      signUpMethods: signUpMethods.filter(Boolean)
    };
  } catch (err) {
    console.error('Error getting filter options:', err);
    return {
      roles: [],
      signUpMethods: []
    };
  }
}

// GET /api/users/profile - Get user profile with order history (Customer)
router.get('/profile', authorize(['customer', 'staff']), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const ordersQuery = Order.find({ user: userId })
            .populate('items.product', 'name productImageUrl')
            .sort({ createdAt: -1 });

        const totalOrders = await Order.countDocuments({ user: userId });
        const orders = await ordersQuery.skip(skip).limit(limit);

        res.json({ 
            user, 
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            }
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// PUT /api/users/profile - Update user profile (Customer) - MOVED BEFORE /:id route
router.put('/profile', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, profilePic } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use by another account' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        profilePic: profilePic || null
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/change-password - Change user password (Customer) - MOVED BEFORE /:id route
router.put('/change-password', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must contain at least one letter and one number' 
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id - Get user by ID with order history
router.get('/:id', authorize(['staff']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's order history
    const orders = await Order.find({ user: req.params.id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      orderHistory: orders
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authorize(['staff']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    
    // Validate inputs
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authorize(['staff']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of last admin
    if (user.role === 'staff') {
      const staffCount = await User.countDocuments({ role: 'staff' });
      if (staffCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the last staff member' 
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/membership/process-checkout - Process membership from checkout
router.put('/membership/process-checkout', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const { contract, idUpload } = req.body;
    const userId = req.user._id;

    // Validate required data
    if (!contract || !contract.signed || !contract.signatureData) {
      return res.status(400).json({ message: 'Valid contract signature is required' });
    }

    if (!idUpload || !idUpload.uploaded || !idUpload.fileUrl) {
      return res.status(400).json({ message: 'Valid ID upload is required' });
    }

    // Update user membership
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'membership.isMember': true,
          'membership.membershipType': 'online',
          'membership.membershipDate': new Date(),
          'membership.contract': {
            signed: true,
            signatureData: contract.signatureData,
            agreementVersion: contract.agreementVersion || '1.0',
            signedAt: new Date(),
            signedOnline: true
          },
          'membership.idVerification': {
            verified: false, // Needs admin verification
            fileName: idUpload.fileName,
            fileUrl: idUpload.fileUrl,
            uploadedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Membership processed successfully. ID verification pending admin approval.',
      membership: updatedUser.membership
    });

  } catch (err) {
    console.error('Error processing membership from checkout:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/membership/admin-process - Admin manually process membership
router.put('/membership/admin-process', authorize(['staff']), async (req, res) => {
  try {
    const { 
      userId, 
      contract, 
      idVerification, 
      inPersonDetails 
    } = req.body;
    const staffId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Build update object
    const updateObj = {
      'membership.isMember': true,
      'membership.membershipType': 'in_person',
      'membership.membershipDate': new Date(),
      'membership.inPersonDetails': {
        processedBy: staffId,
        processedAt: new Date(),
        location: inPersonDetails?.location || 'Office',
        notes: inPersonDetails?.notes || ''
      }
    };

    // Handle contract
    if (contract) {
      updateObj['membership.contract'] = {
        signed: true,
        signatureData: contract.signatureData || '',
        agreementVersion: contract.agreementVersion || '1.0',
        signedAt: new Date(),
        signedOnline: false
      };
    }

    // Handle ID verification
    if (idVerification) {
      updateObj['membership.idVerification'] = {
        verified: true,
        fileName: idVerification.fileName || 'Manual_Entry',
        fileUrl: idVerification.fileUrl || '',
        uploadedAt: new Date(),
        verifiedBy: staffId,
        verifiedAt: new Date(),
        notes: idVerification.notes || 'Processed in person'
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    ).populate('membership.idVerification.verifiedBy', 'firstName lastName')
     .populate('membership.inPersonDetails.processedBy', 'firstName lastName');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Membership processed successfully by admin',
      user: updatedUser
    });

  } catch (err) {
    console.error('Error processing membership by admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/membership/verify-id - Admin verify uploaded ID
router.put('/membership/verify-id', authorize(['staff']), async (req, res) => {
  try {
    const { userId, verified, notes } = req.body;
    const staffId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const updateObj = {
      'membership.idVerification.verified': verified,
      'membership.idVerification.verifiedBy': staffId,
      'membership.idVerification.verifiedAt': new Date(),
      'membership.idVerification.notes': notes || ''
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    ).populate('membership.idVerification.verifiedBy', 'firstName lastName');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `ID verification ${verified ? 'approved' : 'rejected'} successfully`,
      user: updatedUser
    });

  } catch (err) {
    console.error('Error verifying ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/membership/:userId - Get user membership details
router.get('/membership/:userId', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only access their own membership, staff can access any
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(requestedUserId)
      .populate('membership.idVerification.verifiedBy', 'firstName lastName')
      .populate('membership.inPersonDetails.processedBy', 'firstName lastName')
      .select('firstName lastName email membership');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        membership: user.membership
      }
    });

  } catch (err) {
    console.error('Error fetching user membership:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/:userId/process-membership - Process membership after order completion
router.post('/:userId/process-membership', authorize(['customer', 'staff']), async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    
    // Users can only process their own membership, staff can process any
    if (req.user.role !== 'staff' && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (user.membership && user.membership.isMember) {
      return res.json({ 
        message: 'User is already a member',
        membership: user.membership 
      });
    }

    // Create basic membership after first order
    const membershipData = {
      isMember: true,
      membershipType: 'online',
      membershipDate: new Date(),
      source: 'first_order',
      contract: {
        signed: false,
        signatureData: null,
        agreementVersion: '1.0',
        signedAt: null,
        signedOnline: false
      },
      idVerification: {
        verified: false,
        fileName: '',
        fileUrl: '',
        uploadedAt: null
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      requestedUserId,
      { 
        $set: { 
          membership: membershipData,
          'membership.processedAt': new Date()
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Membership processed successfully after order completion',
      membership: updatedUser.membership
    });

  } catch (err) {
    console.error('Error processing membership after order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;