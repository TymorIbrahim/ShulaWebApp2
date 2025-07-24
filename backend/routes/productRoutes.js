const express = require("express");
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/order.model');
const multer = require("multer");
const path = require("path");
const authorize = require("../middleware/auth");


// Storage config for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure you have a folder named "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ex: 1234567890.jpg
  }
});
// Initialize upload middleware
const upload = multer({ storage });


// GET /api/products - Get all products with filtering, pagination, and search
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      availability = '',
      inStock,
      featured,
      condition
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
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Category filter
    if (category) {
      matchConditions.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      matchConditions.price = {};
      if (minPrice) matchConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) matchConditions.price.$lte = parseFloat(maxPrice);
    }

    // Availability filter (legacy)
    if (availability === 'available') {
      matchConditions.available = true;
    } else if (availability === 'unavailable') {
      matchConditions.available = false;
    }

    // Stock filter - DATABASE LEVEL
    if (inStock === 'true') {
      matchConditions['inventory.totalUnits'] = { $gt: 0 };
    } else if (inStock === 'false') {
      matchConditions['inventory.totalUnits'] = { $lte: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      matchConditions.featured = true;
    }

    // Condition filter
    if (condition) {
      matchConditions.condition = condition;
    }

    // Stage 1: Initial match
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 2: Count total documents for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    
    // Stage 3: Sort
    const sortObj = {};
    if (sortBy === 'inventory') {
      sortObj['inventory.totalUnits'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    pipeline.push({ $sort: sortObj });

    // Stage 4: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Execute both pipelines in parallel
    const [productsResult, countResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.aggregate(countPipeline)
    ]);

    const products = productsResult;
    const totalProducts = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Get available categories and conditions for filtering (optimized)
    const [categories, conditions, priceRange, statistics] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('condition'),
      getPriceRange(),
      calculateProductStatistics()
    ]);

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      },
      statistics,
      filters: {
        categories: categories.filter(Boolean),
        conditions: conditions.filter(Boolean),
        priceRange
      }
    });

  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get price range
async function getPriceRange() {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    return result.length > 0 ? result[0] : { minPrice: 0, maxPrice: 0 };
  } catch (err) {
    console.error('Error getting price range:', err);
    return { minPrice: 0, maxPrice: 0 };
  }
}

// Helper function to calculate product statistics
async function calculateProductStatistics() {
  try {
    // Use aggregation pipeline for efficient statistics calculation
    const statisticsResult = await Product.aggregate([
      {
        $facet: {
          // Basic counts
          basicCounts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                featured: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } }
              }
            }
          ],
          // Inventory statistics
          inventoryStats: [
            {
              $group: {
                _id: null,
                totalInventory: { $sum: '$inventory.totalUnits' },
                outOfStock: { 
                  $sum: { 
                    $cond: [
                      { $eq: ['$inventory.totalUnits', 0] }, 
                      1, 
                      0 
                    ] 
                  } 
                },
                lowStock: { 
                  $sum: { 
                    $cond: [
                      { 
                        $and: [
                          { $gt: ['$inventory.totalUnits', 0] },
                          { $lte: ['$inventory.totalUnits', '$inventory.minStockAlert'] }
                        ]
                      }, 
                      1, 
                      0 
                    ] 
                  } 
                }
              }
            }
          ],
          // Available conditions
          conditions: [
            {
              $group: {
                _id: '$condition',
                count: { $sum: 1 }
              }
            },
            {
              $match: {
                _id: { $ne: null }
              }
            }
          ]
        }
      }
    ]);

    // Process results
    const stats = statisticsResult[0];
    
    const basicStats = stats.basicCounts[0] || { total: 0, featured: 0 };
    const inventoryStats = stats.inventoryStats[0] || { totalInventory: 0, outOfStock: 0, lowStock: 0 };
    const conditions = stats.conditions.map(c => c._id).filter(Boolean);
    
    return {
      total: basicStats.total,
      totalInventory: inventoryStats.totalInventory,
      lowStock: inventoryStats.lowStock,
      outOfStock: inventoryStats.outOfStock,
      featured: basicStats.featured,
      conditions
    };
  } catch (err) {
    console.error('Error calculating product statistics:', err);
    return {
      total: 0,
      totalInventory: 0,
      lowStock: 0,
      outOfStock: 0,
      featured: 0,
      conditions: []
    };
  }
}

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', authorize(['admin', 'staff']), async (req, res) => {
  try {
    const { 
        name, description, price, category, brand, condition, 
        specifications, tags, featured, totalUnits, minStockAlert, productImageUrl 
    } = req.body;

    // Input validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      brand,
      condition,
      specifications,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(tag => tag.trim()),
      featured,
      inventory: {
        totalUnits: totalUnits || 0,
        minStockAlert: minStockAlert || 1
      },
      productImageUrl,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authorize(['staff']), async (req, res) => {
  try {
    const { name, description, price, category, productImageUrl, isAvailable } = req.body;

    // Input validation
    if (name && !name.trim()) {
      return res.status(400).json({ message: 'Product name cannot be empty' });
    }

    if (price && price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category.trim();
    if (productImageUrl !== undefined) updateData.productImageUrl = productImageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authorize(['staff']), async (req, res) => {
  try {
    const productId = req.params.id;

    const orderCount = await Order.countDocuments({ 'items.product': productId });

    if (orderCount > 0) {
      return res.status(400).json({ 
        message: 'This product cannot be deleted because it is associated with existing orders. Please remove it from all orders before deleting.' 
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/stats/dashboard - Get dashboard statistics
router.get("/stats/dashboard", async (req, res) => {
  try {
    const stats = await calculateProductStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/products/:id/update-stats - Update rental statistics for a product (Admin only)
router.put('/:id/update-stats', authorize(['staff']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.updateRentalStats();
    
    res.json({
      message: 'Product rental statistics updated successfully',
      product: product
    });
  } catch (err) {
    console.error('Error updating product stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/bulk-update-stats - Update rental statistics for all products (Admin only)
router.post('/bulk-update-stats', authorize(['staff']), async (req, res) => {
  try {
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        await product.updateRentalStats();
        updatedCount++;
      } catch (err) {
        console.error(`Error updating stats for product ${product._id}:`, err);
      }
    }
    
    res.json({
      message: `Successfully updated statistics for ${updatedCount} products`,
      updatedCount,
      totalProducts: products.length
    });
  } catch (err) {
    console.error('Error bulk updating product stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/popular/featured - Get popular products for featured display
router.get('/popular/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    // Get products sorted by popularity score and rental count
    const popularProducts = await Product.find({
      available: true,
      'inventory.totalUnits': { $gt: 0 }
    })
    .sort({ 
      'rentalStats.popularityScore': -1, 
      'rentalStats.totalRentals': -1,
      featured: -1 
    })
    .limit(parseInt(limit))
    .select('name price category productImageUrl rentalStats inventory featured');

    res.json(popularProducts);
  } catch (err) {
    console.error('Error fetching popular products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id/inventory - Update product inventory (Admin only)
router.put('/:id/inventory', authorize(['staff']), async (req, res) => {
  try {
    const { totalUnits, minStockAlert, reservedUnits } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update inventory fields
    if (totalUnits !== undefined) {
      product.inventory.totalUnits = Math.max(0, parseInt(totalUnits));
    }
    if (minStockAlert !== undefined) {
      product.inventory.minStockAlert = Math.max(0, parseInt(minStockAlert));
    }
    if (reservedUnits !== undefined) {
      product.inventory.reservedUnits = Math.max(0, parseInt(reservedUnits));
    }

    await product.save();

    res.json({
      message: 'Product inventory updated successfully',
      product: product
    });
  } catch (err) {
    console.error('Error updating product inventory:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/management/overview - Get comprehensive management overview (Admin only)
router.get('/management/overview', authorize(['staff']), async (req, res) => {
  try {
    // Get low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$inventory.totalUnits', '$inventory.minStockAlert'] }
    }).sort({ 'inventory.totalUnits': 1 });

    // Get most popular products
    const popularProducts = await Product.find({})
      .sort({ 'rentalStats.totalRentals': -1 })
      .limit(10)
      .select('name rentalStats.totalRentals rentalStats.popularityScore rentalStats.lastRented');

    // Get products needing maintenance
    const needingMaintenance = await Product.find({
      'maintenanceStatus.nextMaintenance': { $lte: new Date() }
    });

    // Get out of stock products
    const outOfStock = await Product.find({
      'inventory.totalUnits': 0
    });

    // Get recent rentals summary
    const recentRentals = await Order.find({
      status: { $in: ['Accepted', 'Completed'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      lowStockProducts,
      popularProducts,
      needingMaintenance,
      outOfStock,
      recentRentals,
      summary: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStock.length,
        maintenanceNeededCount: needingMaintenance.length,
        recentRentalsCount: recentRentals.length
      }
    });
  } catch (err) {
    console.error('Error fetching management overview:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id/maintenance - Update maintenance status (Admin only)
router.put('/:id/maintenance', authorize(['staff']), async (req, res) => {
  try {
    const { lastMaintenance, nextMaintenance, maintenanceNotes } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update maintenance fields
    if (lastMaintenance) {
      product.maintenanceStatus.lastMaintenance = new Date(lastMaintenance);
    }
    if (nextMaintenance) {
      product.maintenanceStatus.nextMaintenance = new Date(nextMaintenance);
    }
    if (maintenanceNotes !== undefined) {
      product.maintenanceStatus.maintenanceNotes = maintenanceNotes;
    }

    await product.save();

    res.json({
      message: 'Product maintenance status updated successfully',
      product: product
    });
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/validate-availability - Validate product availability for checkout
router.post('/:id/validate-availability', async (req, res) => {
  try {
    const { rentalPeriod, quantity = 1 } = req.body;
    
    if (!rentalPeriod || !rentalPeriod.startDate || !rentalPeriod.endDate) {
      return res.status(400).json({ 
        isAvailable: false,
        message: 'תקופת השכירות חובה (תאריך התחלה וסיום)' 
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        isAvailable: false,
        message: 'המוצר לא נמצא' 
      });
    }

    // Get real-time availability
    const availability = await product.getRealTimeAvailability();
    
    // Check if product has enough units available
    if (availability.availableNow < quantity) {
      return res.status(200).json({
        isAvailable: false,
        message: `רק ${availability.availableNow} יחידות זמינות, נדרש ${quantity}`,
        availableUnits: availability.availableNow,
        totalUnits: availability.totalUnits,
        currentlyRented: availability.currentlyRented,
        currentlyReserved: availability.currentlyReserved
      });
    }

    // Check for date conflicts with existing orders
    const startDate = new Date(rentalPeriod.startDate);
    const endDate = new Date(rentalPeriod.endDate);
    
    // Get availability for specific dates
    const dateAvailability = await product.getAvailabilityForDates(startDate, endDate);
    
    if (dateAvailability.availableUnits < quantity) {
      return res.status(200).json({
        isAvailable: false,
        message: `לא זמין לתאריכים הנבחרים (${dateAvailability.availableUnits} יחידות זמינות מתוך ${quantity} נדרש)`,
        availableUnits: dateAvailability.availableUnits,
        totalUnits: availability.totalUnits,
        conflictingDates: dateAvailability.conflictingOrders || []
      });
    }

    // Validation passed
    return res.status(200).json({
      isAvailable: true,
      message: 'המוצר זמין לתאריכים הנבחרים',
      availableUnits: dateAvailability.availableUnits,
      totalUnits: availability.totalUnits,
      realTimeData: availability,
      validatedAt: new Date()
    });

  } catch (err) {
    console.error('Error validating product availability:', err);
    res.status(500).json({ 
      isAvailable: false,
      message: 'שגיאה בבדיקת זמינות המוצר' 
    });
  }
});

// GET /api/products/:id/real-time-availability - Get real-time availability data
router.get('/:id/real-time-availability', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const availability = await product.getRealTimeAvailability();
    
    res.json({
      productId: req.params.id,
      availability,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error fetching real-time availability:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/reserve - Create temporary reservation
router.post('/:id/reserve', async (req, res) => {
  try {
    const { rentalPeriod, quantity = 1, customerId } = req.body;
    
    if (!rentalPeriod || !customerId) {
      return res.status(400).json({ message: 'תקופת השכירות ומזהה לקוח חובה' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'המוצר לא נמצא' });
    }

    try {
      const reservation = await product.createReservation(customerId, rentalPeriod, quantity);
      
      res.status(201).json({
        message: 'הזמנה זמנית נוצרה בהצלחה',
        reservation: reservation,
        expiresIn: Math.ceil((reservation.expiresAt - new Date()) / 60000) // minutes
      });
    } catch (err) {
      res.status(400).json({ 
        message: err.message || 'לא ניתן ליצור הזמנה זמנית' 
      });
    }
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;