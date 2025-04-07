const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

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

module.exports = router;
