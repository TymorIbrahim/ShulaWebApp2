const mongoose = require('mongoose');
require('dotenv').config();

async function showTestDataSummary() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const Order = require('../models/order.model');
        const User = require('../models/user.model');
        const Product = require('../models/Product');
        
        console.log('📊 Test Data Summary Report');
        console.log('=' * 50);
        
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        console.log(`\n📈 Overall Statistics:`);
        console.log(`👥 Users: ${totalUsers}`);
        console.log(`📋 Orders: ${totalOrders}`);
        console.log(`📦 Products: ${totalProducts}`);
        
        // Order status breakdown
        const statusBreakdown = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log(`\n📊 Order Status Breakdown:`);
        statusBreakdown.forEach(item => {
            console.log(`   ${item._id}: ${item.count}`);
        });
        
        // Sample users
        const sampleUsers = await User.find().limit(5).select('firstName lastName email phone');
        console.log(`\n👥 Sample Users:`);
        sampleUsers.forEach(user => {
            console.log(`   ${user.firstName} ${user.lastName} (${user.email})`);
        });
        
        // Sample orders with details
        const sampleOrders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name price')
            .limit(5)
            .sort({ createdAt: -1 });
            
        console.log(`\n📋 Sample Recent Orders:`);
        sampleOrders.forEach(order => {
            const user = order.user;
            const itemCount = order.items.length;
            const firstItem = order.items[0];
            const startDate = firstItem?.rentalPeriod?.startDate 
                ? new Date(firstItem.rentalPeriod.startDate).toLocaleDateString('he-IL')
                : 'N/A';
            
            console.log(`   ${user.firstName} ${user.lastName} - ${itemCount} item(s) - ${order.status} - Starts: ${startDate}`);
        });
        
        // Date range analysis
        const dateRanges = await Order.aggregate([
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: null,
                    earliestStart: { $min: '$items.rentalPeriod.startDate' },
                    latestStart: { $max: '$items.rentalPeriod.startDate' },
                    earliestEnd: { $min: '$items.rentalPeriod.endDate' },
                    latestEnd: { $max: '$items.rentalPeriod.endDate' }
                }
            }
        ]);
        
        if (dateRanges.length > 0) {
            const range = dateRanges[0];
            console.log(`\n📅 Date Ranges:`);
            console.log(`   Earliest rental start: ${new Date(range.earliestStart).toLocaleDateString('he-IL')}`);
            console.log(`   Latest rental start: ${new Date(range.latestStart).toLocaleDateString('he-IL')}`);
            console.log(`   Latest rental end: ${new Date(range.latestEnd).toLocaleDateString('he-IL')}`);
        }
        
        // Multi-item orders
        const multiItemOrders = await Order.countDocuments({
            $expr: { $gt: [{ $size: "$items" }, 1] }
        });
        
        console.log(`\n📦 Order Complexity:`);
        console.log(`   Single item orders: ${totalOrders - multiItemOrders}`);
        console.log(`   Multi-item orders: ${multiItemOrders}`);
        
        await mongoose.disconnect();
        console.log('\n✅ Summary completed successfully!');
        
    } catch (error) {
        console.error('❌ Error showing test data summary:', error);
        process.exit(1);
    }
}

showTestDataSummary(); 