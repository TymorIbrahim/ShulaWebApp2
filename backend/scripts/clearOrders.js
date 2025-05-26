const mongoose = require('mongoose');
require('dotenv').config();

async function clearOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const Order = require('../models/order.model');
        
        console.log('🗑️  Clearing all orders from database...');
        
        const orderCount = await Order.countDocuments();
        console.log(`Found ${orderCount} orders to delete.`);
        
        if (orderCount === 0) {
            console.log('No orders to delete.');
            await mongoose.disconnect();
            return;
        }
        
        // Delete all orders
        const result = await Order.deleteMany({});
        console.log(`✅ Successfully deleted ${result.deletedCount} orders.`);
        
        // Verify deletion
        const remainingOrders = await Order.countDocuments();
        if (remainingOrders === 0) {
            console.log('✅ All orders have been successfully cleared from the database.');
        } else {
            console.log(`⚠️  Warning: ${remainingOrders} orders still remain in the database.`);
        }
        
        await mongoose.disconnect();
        console.log('Database disconnected.');
    } catch (error) {
        console.error('❌ Error clearing orders:', error);
        process.exit(1);
    }
}

clearOrders(); 