const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const Order = require('../models/order.model');
        const User = require('../models/user.model');
        
        const orderCount = await Order.countDocuments();
        const userCount = await User.countDocuments();
        
        console.log('Current database state:');
        console.log('Orders:', orderCount);
        console.log('Users:', userCount);
        
        // Show some sample orders
        const sampleOrders = await Order.find().limit(3).populate('user', 'firstName lastName email');
        console.log('\nSample orders:');
        sampleOrders.forEach(order => {
            console.log(`- Order ${order._id}: ${order.user?.firstName} ${order.user?.lastName} (${order.status})`);
        });
        
        await mongoose.disconnect();
        console.log('\nDatabase check completed.');
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase(); 