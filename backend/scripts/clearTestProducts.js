const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });


const clearTestProducts = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected...');

        const result = await Product.deleteMany({ 
            $or: [
                { name: { $regex: /^Test Product/ } },
                { imageUrl: 'http://example.com/test-image.jpg' }
            ]
        });

        console.log(`Deleted ${result.deletedCount} test products.`);
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

clearTestProducts(); 