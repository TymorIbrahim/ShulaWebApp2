const mongoose = require("mongoose");
const Product = require("./models/Product"); // Import the Product model
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB for import"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Function to import products from CSV
const importProducts = async () => {
    const products = [];

    // Read the CSV file
    fs.createReadStream("./catalog_products.csv") // Ensure correct file path
        .pipe(csv())
        .on("data", (row) => {
            //console.log("🔍 Raw row data:", row); // Debugging output

            const product = {
                _id: new mongoose.Types.ObjectId(), // Assign a unique ID automatically
                name: row.name || "Unnamed Product",
                description: row.description || "",
                productImageUrl: row.productImageUrl || "",
                category: row.collection || "Uncategorized",
                price: row.price ? parseFloat(row.price) : 0,
                sku: row.sku || null,
                brand: row.brand || "Generic",
                available: row.visible === "true" // Convert string "true"/"false" to boolean
            };

            products.push(product);
        })
        .on("end", async () => {
            console.log(`✅ Finished reading CSV file.`);
            console.log(`Total products to import: ${products.length}`);

            if (products.length > 0) {
                try {
                    await Product.insertMany(products);
                    console.log(`✅ Successfully imported ${products.length} products!`);
                } catch (error) {
                    console.error("❌ Error importing products:", error);
                }
            } else {
                console.warn("⚠️ No products were imported. Check CSV file.");
            }

            mongoose.connection.close(); // Close connection after import
        });
};

importProducts();
