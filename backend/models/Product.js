const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    productImageUrl: { type: String, default: "" },
    category: { type: String, default: "Uncategorized" },
    price: { type: Number, required: true },
    sku: { type: String, default: null },
    brand: { type: String, default: "Generic" },
    available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
