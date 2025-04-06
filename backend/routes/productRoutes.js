const express = require("express");
const Product = require("../models/Product"); // Import the Product model

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   POST /api/products
// @desc    Add a new product
// @access  Public
router.post("/", async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: "Error creating product", error: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Public
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Export the router to be used in `server.js`
module.exports = router;
