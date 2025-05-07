const express = require("express");
const router = express.Router();
const Product = require('../models/Product');
const multer = require("multer");
const path = require("path");


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


// GET /api/products - Retrieve all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/products/:productId - Retrieve a single product by ID
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST - add product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, status, conditionNotes, category  } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price required.' });
    }
    const newProduct = new Product({
      name,
      description,
      price,
      productImageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      category: category || "Uncategorized",
      sku: null,
      brand: 'Generic',
      available: status === 'Available',
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE /api/products/:productId — delete one product
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    // Remove from the database
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// PUT /api/products/:productId  — update existing product (with optional image)
router.put(
  "/:productId",
  upload.single("image"),           // accept an optional new image file
  async (req, res) => {
    try {
      // build an updates object from the incoming form‑fields
      const updates = {
        name:           req.body.name,
        description:    req.body.description,
        price:          req.body.price,
        category:       req.body.category,
        available:      req.body.status === "Available",
        conditionNotes: req.body.conditionNotes,
      };
      // if a new image was uploaded, include its URL
      if (req.file) {
        updates.productImageUrl = `/uploads/${req.file.filename}`;
      }

      // perform the update
      const updated = await Product.findByIdAndUpdate(
        req.params.productId,
        updates,
        { new: true }               // ← return the updated document
      );
      if (!updated) return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error in PUT /api/products/:id", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



module.exports = router;