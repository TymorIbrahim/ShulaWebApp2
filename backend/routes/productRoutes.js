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

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Availability filter (legacy)
    if (availability === 'available') {
      query.available = true;
    } else if (availability === 'unavailable') {
      query.available = false;
    }

    // Stock filter
    if (inStock === 'true') {
      query['inventory.totalUnits'] = { $gt: 0 };
    } else if (inStock === 'false') {
      query['inventory.totalUnits'] = { $lte: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === 'inventory') {
      sortObj['inventory.totalUnits'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Get available categories and conditions for filtering
    const categories = await Product.distinct('category');
    const conditions = await Product.distinct('condition');

    // Calculate statistics
    const statistics = await calculateProductStatistics();

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
        priceRange: await getPriceRange()
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
    // Basic counts
    const total = await Product.countDocuments();
    const featured = await Product.countDocuments({ featured: true });
    
    // Get all products to calculate inventory statistics
    const products = await Product.find({}, 'inventory condition');
    
    let totalInventory = 0;
    let outOfStock = 0;
    let lowStock = 0;
    
    products.forEach(product => {
      const units = product.inventory?.totalUnits || 0;
      const minAlert = product.inventory?.minStockAlert || 1;
      
      totalInventory += units;
      
      if (units === 0) {
        outOfStock++;
      } else if (units <= minAlert) {
        lowStock++;
      }
    });
    
    // Get available conditions for filtering
    const conditions = await Product.distinct('condition');
    
    return {
      total,
      totalInventory,
      lowStock,
      outOfStock,
      featured,
      conditions: conditions.filter(Boolean)
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
router.post('/', authorize(['staff']), async (req, res) => {
  try {
    const { name, description, price, category, productImageUrl, isAvailable = true } = req.body;

    // Input validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      category: category.trim(),
      productImageUrl,
      isAvailable
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });
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
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
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

module.exports = router;