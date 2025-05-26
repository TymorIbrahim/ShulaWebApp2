const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Realistic Hebrew names and data
const hebrewFirstNames = [
    'דוד', 'משה', 'אברהם', 'יצחק', 'יעקב', 'שרה', 'רבקה', 'רחל', 'לאה',
    'מיכל', 'דנה', 'תמר', 'נועה', 'מור', 'שירה', 'רותם', 'גל', 'עדן',
    'אור', 'ליאור', 'עמית', 'רון', 'טל', 'יואב', 'אלון', 'איתי', 'נתן',
    'מעיין', 'שני', 'הדר', 'יערה', 'אילנה', 'ענת', 'מירי', 'חנה', 'אסתר'
];

const hebrewLastNames = [
    'כהן', 'לוי', 'מיזרחי', 'פרץ', 'ביטון', 'מרדכי', 'אזולאי', 'עמר',
    'אברהם', 'דוד', 'יוסף', 'חדד', 'אבוטבול', 'שוורץ', 'זכריה', 'גולן',
    'ברק', 'אשכנזי', 'ספרדי', 'יעקובי', 'רוזן', 'פרידמן', 'ישראלי', 'אורן',
    'בן דוד', 'מלכה', 'טובי', 'סבג', 'חיים', 'אלון', 'שמעון', 'בנימין'
];

const domains = ['gmail.com', 'walla.co.il', 'yahoo.com', 'hotmail.com', '012.net.il'];

function generateEmail(firstName, lastName) {
    const transliterations = {
        'דוד': 'david', 'משה': 'moshe', 'אברהם': 'abraham', 'יצחק': 'yitzhak',
        'יעקב': 'yaakov', 'שרה': 'sarah', 'רבקה': 'rebecca', 'רחל': 'rachel',
        'לאה': 'leah', 'מיכל': 'michal', 'דנה': 'dana', 'תמר': 'tamar',
        'נועה': 'noa', 'מור': 'mor', 'שירה': 'shira', 'רותם': 'rotem',
        'גל': 'gal', 'עדן': 'eden', 'אור': 'or', 'ליאור': 'lior',
        'עמית': 'amit', 'רון': 'ron', 'טל': 'tal', 'יואב': 'yoav',
        'אלון': 'alon', 'איתי': 'itai', 'נתן': 'natan', 'מעיין': 'maayan',
        'שני': 'shani', 'הדר': 'hadar', 'יערה': 'yaara', 'אילנה': 'ilana',
        'ענת': 'anat', 'מירי': 'miri', 'חנה': 'hana', 'אסתר': 'esther',
        'כהן': 'cohen', 'לוי': 'levi', 'מיזרחי': 'mizrahi', 'פרץ': 'peretz',
        'ביטון': 'biton', 'מרדכי': 'mordechai', 'אזולאי': 'azulay', 'עמר': 'amar',
        'חדד': 'hadad', 'אבוטבול': 'abotbul', 'שוורץ': 'schwartz', 'זכריה': 'zacharia',
        'גולן': 'golan', 'ברק': 'barak', 'אשכנזי': 'ashkenazi', 'ספרדי': 'sfaradi',
        'יעקובי': 'yaakovi', 'רוזן': 'rosen', 'פרידמן': 'friedman', 'ישראלי': 'israeli',
        'אורן': 'oren', 'בן דוד': 'ben-david', 'מלכה': 'malka', 'טובי': 'tobi',
        'סבג': 'sabag', 'חיים': 'haim', 'שמעון': 'shimon', 'בנימין': 'binyamin'
    };
    
    const firstEng = transliterations[firstName] || firstName.toLowerCase();
    const lastEng = transliterations[lastName] || lastName.toLowerCase();
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const separator = Math.random() > 0.5 ? '.' : '';
    const number = Math.random() > 0.7 ? Math.floor(Math.random() * 99) : '';
    
    return `${firstEng}${separator}${lastEng}${number}@${domain}`;
}

function generatePhone() {
    const prefixes = ['050', '052', '053', '054', '055', '058'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}${number}`;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateTestData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const User = require('../models/user.model');
        const Order = require('../models/order.model');
        const Product = require('../models/Product');
        
        console.log('🚀 Generating realistic test data...');
        
        // Get existing products
        const products = await Product.find();
        if (products.length === 0) {
            console.log('❌ No products found in database. Please add products first.');
            await mongoose.disconnect();
            return;
        }
        console.log(`📦 Found ${products.length} products in database.`);
        
        // Check existing users count
        const existingUserCount = await User.countDocuments();
        console.log(`👥 Found ${existingUserCount} existing users.`);
        
        // Generate additional users (aim for total of 25-30 users)
        const targetUserCount = 30;
        const usersToCreate = Math.max(0, targetUserCount - existingUserCount);
        
        const newUsers = [];
        if (usersToCreate > 0) {
            console.log(`👤 Creating ${usersToCreate} new users...`);
            
            for (let i = 0; i < usersToCreate; i++) {
                const firstName = hebrewFirstNames[Math.floor(Math.random() * hebrewFirstNames.length)];
                const lastName = hebrewLastNames[Math.floor(Math.random() * hebrewLastNames.length)];
                const email = generateEmail(firstName, lastName);
                const phone = generatePhone();
                const password = await bcryptjs.hash('123456', 10); // Default password for testing
                
                const user = new User({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password
                });
                
                newUsers.push(user);
            }
            
            await User.insertMany(newUsers);
            console.log(`✅ Created ${newUsers.length} new users.`);
        }
        
        // Get all users for order generation
        const allUsers = await User.find();
        console.log(`👥 Total users available: ${allUsers.length}`);
        
        // Generate orders (aim for 80-120 orders for good testing)
        const ordersToCreate = 100;
        console.log(`📋 Creating ${ordersToCreate} orders...`);
        
        const orders = [];
        const statuses = ['Pending', 'Accepted', 'Rejected'];
        const statusWeights = [0.4, 0.4, 0.2]; // 40% pending, 40% accepted, 20% rejected
        
        // Date ranges for different scenarios
        const now = new Date();
        const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const future30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const future7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        for (let i = 0; i < ordersToCreate; i++) {
            const user = allUsers[Math.floor(Math.random() * allUsers.length)];
            const itemCount = Math.random() > 0.7 ? 2 : 1; // 30% chance of multiple items
            const items = [];
            
            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                
                // Generate rental period
                let startDate, endDate;
                
                // Different scenarios based on order index
                if (i < 20) {
                    // Recent orders (last 7 days) - some might be ongoing
                    const orderAge = Math.floor(Math.random() * 7);
                    startDate = new Date(now.getTime() - orderAge * 24 * 60 * 60 * 1000);
                    endDate = new Date(startDate.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
                } else if (i < 40) {
                    // Upcoming orders (next 7 days) - some urgent
                    const daysFromNow = Math.floor(Math.random() * 7);
                    startDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
                    endDate = new Date(startDate.getTime() + (1 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000);
                } else if (i < 60) {
                    // Future orders (within next 30 days)
                    startDate = getRandomDate(future7Days, future30Days);
                    endDate = new Date(startDate.getTime() + (1 + Math.floor(Math.random() * 6)) * 24 * 60 * 60 * 1000);
                } else {
                    // Older orders (last 30 days)
                    startDate = getRandomDate(past30Days, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
                    endDate = new Date(startDate.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
                }
                
                items.push({
                    product: product._id,
                    rentalPeriod: {
                        startDate,
                        endDate
                    }
                });
            }
            
            // Determine status based on weights
            let status;
            const rand = Math.random();
            if (rand < statusWeights[0]) {
                status = statuses[0]; // Pending
            } else if (rand < statusWeights[0] + statusWeights[1]) {
                status = statuses[1]; // Accepted
            } else {
                status = statuses[2]; // Rejected
            }
            
            // Order creation date (slightly before or at start date)
            const maxOrderAge = 14; // Max 14 days before rental start
            const orderAge = Math.floor(Math.random() * maxOrderAge);
            const createdAt = new Date(items[0].rentalPeriod.startDate.getTime() - orderAge * 24 * 60 * 60 * 1000);
            
            const order = new Order({
                user: user._id,
                items,
                status,
                totalValue: 0,
                createdAt,
                updatedAt: createdAt
            });
            
            orders.push(order);
        }
        
        await Order.insertMany(orders);
        console.log(`✅ Created ${orders.length} orders.`);
        
        // Generate summary
        const summary = {
            pending: orders.filter(o => o.status === 'Pending').length,
            accepted: orders.filter(o => o.status === 'Accepted').length,
            rejected: orders.filter(o => o.status === 'Rejected').length
        };
        
        console.log('\n📊 Test Data Summary:');
        console.log(`👥 Total Users: ${allUsers.length} (${newUsers.length} new)`);
        console.log(`📋 Total Orders: ${orders.length}`);
        console.log(`   - Pending: ${summary.pending}`);
        console.log(`   - Accepted: ${summary.accepted}`);
        console.log(`   - Rejected: ${summary.rejected}`);
        console.log(`📦 Products Available: ${products.length}`);
        
        await mongoose.disconnect();
        console.log('\n✅ Test data generation completed successfully!');
        
    } catch (error) {
        console.error('❌ Error generating test data:', error);
        process.exit(1);
    }
}

generateTestData(); 