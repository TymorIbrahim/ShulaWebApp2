const Product = require("../models/Product");

// @desc   Get all products
// @route  GET /api/products
// @access Public
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ message: "Server error while fetching products." });
    }
};

// @desc   Get a single product by ID
// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).json({ message: "Server error while fetching product." });
    }
};

// @desc   Add a new product
// @route  POST /api/products
// @access Public
const addProduct = async (req, res) => {
    try {
        const { name, description, productImageUrl, category, price, sku, brand, available } = req.body;

        const newProduct = new Product({
            name,
            description: description || "",
            productImageUrl: productImageUrl || "",
            category: category || "Uncategorized",
            price: price || 0,
            sku: sku || null,
            brand: brand || "Generic",
            available: available !== undefined ? available : true
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ message: "Server error while adding product." });
    }
};

// @desc   Update a product by ID
// @route  PUT /api/products/:id
// @access Public
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("❌ Error updating product:", error);
        res.status(500).json({ message: "Server error while updating product." });
    }
};

// @desc   Delete a product by ID
// @route  DELETE /api/products/:id
// @access Public
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json({ message: "✅ Product deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).json({ message: "Server error while deleting product." });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};
