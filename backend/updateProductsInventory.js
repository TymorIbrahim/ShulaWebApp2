// backend/updateProductsInventory.js
// Migration script to add inventory tracking to existing products

const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ShulLaWebAppDB';

async function updateProductsInventory() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Updating products with inventory data...');
        
        // Update all products that don't have inventory data
        const result = await Product.updateMany(
            { 
                $or: [
                    { inventory: { $exists: false } },
                    { 'inventory.totalUnits': { $exists: false } }
                ]
            },
            {
                $set: {
                    'inventory.totalUnits': 5,
                    'inventory.reservedUnits': 0,
                    'inventory.minStockAlert': 1,
                    'condition': 'Excellent',
                    'tags': [],
                    'featured': false,
                    'specifications': ''
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} products with inventory data`);

        // Show updated products count
        const totalProducts = await Product.countDocuments();
        console.log(`📊 Total products in database: ${totalProducts}`);

        // Show some example products
        const exampleProducts = await Product.find({}).limit(3).select('name inventory');
        console.log('\n📦 Example updated products:');
        exampleProducts.forEach(product => {
            console.log(`- ${product.name}: ${product.inventory?.totalUnits || 0} units`);
        });

        console.log('\n🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    updateProductsInventory();
}

module.exports = updateProductsInventory; 