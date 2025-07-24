// Load environment variables first
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Product = require('../models/Product');
const Order = require('../models/order.model');
const Cart = require('../models/Cart');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random Hebrew names
const hebrewFirstNames = [
  'דוד', 'משה', 'יוסף', 'אברהם', 'יעקב', 'יצחק', 'שמואל', 'דניאל', 'מיכאל', 'אליהו',
  'שרה', 'רבקה', 'רחל', 'לאה', 'מרים', 'אסתר', 'רות', 'נעמי', 'תמר', 'דינה',
  'אמיר', 'רון', 'גיל', 'עמית', 'יונתן', 'אלון', 'עידו', 'נתן', 'אורי', 'טל',
  'נועה', 'מיכל', 'שירה', 'ליאור', 'מאיה', 'יעל', 'הדר', 'ענת', 'אורית', 'גלית',
  'אבי', 'בני', 'גדי', 'דור', 'הראל', 'זיו', 'חגי', 'טוב', 'יאיר', 'כפיר',
  'לינה', 'מור', 'נטע', 'סיון', 'עדן', 'פנינה', 'צפירה', 'קרן', 'רונית', 'שלומית'
];

const hebrewLastNames = [
  'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'דהן', 'אברהם', 'אזולאי', 'מלכה', 'אוחנה',
  'שמיר', 'רוזן', 'פרידמן', 'גולדברג', 'שוורץ', 'גרין', 'ברק', 'אלון', 'דור', 'גל',
  'אבני', 'בר', 'גבע', 'דגן', 'הרץ', 'ויס', 'זהר', 'חן', 'טל', 'יעקב',
  'כץ', 'לב', 'מור', 'נוי', 'סער', 'עוז', 'פז', 'צור', 'קדם', 'רם',
  'שלום', 'תמיר', 'אור', 'בן', 'גור', 'דוד', 'הדר', 'ורד', 'זיו', 'חיים'
];

// Generate random phone number
const generatePhoneNumber = () => {
  const prefixes = ['050', '052', '053', '054', '055', '058'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}-${number.toString().substring(0, 3)}-${number.toString().substring(3)}`;
};

// Generate random email
const generateEmail = (firstName, lastName) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'walla.co.il', 'nana.co.il'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
  return `${emailName}@${domain}`;
};

// Clear existing data (keep admin users)
const clearData = async () => {
  console.log('🧹 Clearing existing data...');
  
  // Clear customer users (keep staff)
  const deletedUsers = await User.deleteMany({ role: 'customer' });
  console.log(`   Deleted ${deletedUsers.deletedCount} customer users`);
  
  // Clear all orders
  const deletedOrders = await Order.deleteMany({});
  console.log(`   Deleted ${deletedOrders.deletedCount} orders`);
  
  // Clear all carts
  const deletedCarts = await Cart.deleteMany({});
  console.log(`   Deleted ${deletedCarts.deletedCount} carts`);
  
  console.log('✅ Data cleared successfully');
};

// Create the new admin user
const createAdminUser = async () => {
  console.log('👤 Creating admin user...');
  
  // Check if admin user already exists
  const existingAdmin = await User.findOne({ email: 'einat@shula.com' });
  if (existingAdmin) {
    console.log('   Admin user already exists, deleting and recreating...');
    await User.deleteOne({ email: 'einat@shula.com' });
  }
  
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('test123', salt);
  
  const adminUser = new User({
    firstName: 'עינת',
    lastName: 'רודמן',
    email: 'einat@shula.com',
    phone: '050-123-4567',
    password: hashedPassword,
    role: 'staff',
    signUpMethod: 'local',
    membership: {
      isMember: true,
      membershipType: 'in_person',
      membershipDate: new Date(),
      contract: {
        signed: true,
        signatureData: 'Staff Member',
        agreementVersion: '1.0',
        signedAt: new Date(),
        signedOnline: false
      },
      idVerification: {
        verified: true,
        fileName: 'Staff_ID',
        fileUrl: '',
        uploadedAt: new Date(),
        verifiedBy: null,
        verifiedAt: new Date(),
        notes: 'Staff member - auto verified'
      },
      inPersonDetails: {
        processedBy: null,
        processedAt: new Date(),
        location: 'Main Office',
        notes: 'Staff member - auto processed'
      }
    }
  });
  
  await adminUser.save();
  console.log('✅ Admin user created: עינת רודמן (einat@shula.com)');
  return adminUser;
};

// Generate customer users
const generateCustomers = async () => {
  console.log('👥 Generating 150 customer users...');
  
  const customers = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  for (let i = 0; i < 150; i++) {
    const firstName = hebrewFirstNames[Math.floor(Math.random() * hebrewFirstNames.length)];
    const lastName = hebrewLastNames[Math.floor(Math.random() * hebrewLastNames.length)];
    const email = generateEmail(firstName, lastName);
    const phone = generatePhoneNumber();
    const joinDate = randomDate(oneYearAgo, new Date());
    
    // 85% are existing members, 15% are new customers
    const isMember = Math.random() < 0.85;
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    let membership = null;
    if (isMember) {
      const membershipDate = randomDate(oneYearAgo, joinDate);
      const membershipType = Math.random() < 0.7 ? 'in_person' : 'online';
      
      membership = {
        isMember: true,
        membershipType,
        membershipDate,
        contract: {
          signed: true,
          signatureData: membershipType === 'online' ? 'Digital Signature' : 'In Person Signature',
          agreementVersion: '1.0',
          signedAt: membershipDate,
          signedOnline: membershipType === 'online'
        },
        idVerification: {
          verified: true,
          fileName: `ID_${firstName}_${lastName}`,
          fileUrl: membershipType === 'online' ? '/uploads/ids/sample.jpg' : '',
          uploadedAt: membershipDate,
          verifiedBy: membershipType === 'online' ? null : null,
          verifiedAt: membershipDate,
          notes: membershipType === 'online' ? 'Online verification completed' : 'In-person verification completed'
        }
      };
      
      if (membershipType === 'in_person') {
        membership.inPersonDetails = {
          processedBy: null, // Will be set to admin later
          processedAt: membershipDate,
          location: 'Main Office',
          notes: 'Processed during regular business hours'
        };
      }
    }
    
    const customer = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
      signUpMethod: Math.random() < 0.8 ? 'local' : 'google',
      membership,
      createdAt: joinDate,
      updatedAt: joinDate
    });
    
    customers.push(customer);
  }
  
  await User.insertMany(customers);
  console.log('✅ 150 customers generated successfully');
  return customers;
};

// Generate orders with realistic distribution
const generateOrders = async (customers, products, adminUser) => {
  console.log('📦 Generating 500 realistic orders...');
  
  const orders = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Order status distribution
  const statusDistribution = {
    'Completed': 350,    // 70% - Most orders are completed (archived)
    'Accepted': 60,      // 12% - Future accepted orders
    'PickedUp': 40,      // 8% - Currently ongoing rentals
    'Pending': 30,       // 6% - Pending approval
    'Rejected': 20       // 4% - Rejected orders
  };
  
  let orderIndex = 0;
  
  for (const [status, count] of Object.entries(statusDistribution)) {
    for (let i = 0; i < count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderDate = randomDate(oneYearAgo, today);
      
      // Select 1-3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find(p => p._id.equals(product._id))) {
          selectedProducts.push(product);
        }
      }
      
      // Generate rental period based on status
      let startDate, endDate;
      
      if (status === 'Completed') {
        // Completed orders - in the past
        startDate = randomDate(oneYearAgo, new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      } else if (status === 'PickedUp') {
        // Currently ongoing - some due today, some in future
        const daysAgo = Math.floor(Math.random() * 5) + 1;
        startDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        if (i < 15) {
          // 15 orders due today
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Rest due in future
          const daysFromNow = Math.floor(Math.random() * 10) + 1;
          endDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
        }
      } else if (status === 'Accepted') {
        // Future accepted orders
        if (i < 10) {
          // 10 orders to be picked up today
          startDate = new Date(today);
          startDate.setHours(9, 0, 0, 0);
          endDate = new Date(today.getTime() + (Math.floor(Math.random() * 5) + 2) * 24 * 60 * 60 * 1000);
        } else {
          // Future orders
          const daysFromNow = Math.floor(Math.random() * 30) + 1;
          startDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
          endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
        }
      } else {
        // Pending/Rejected - recent orders
        const daysAgo = Math.floor(Math.random() * 14);
        startDate = new Date(today.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      }
      
      // Build order items
      const items = selectedProducts.map(product => ({
        product: product._id,
        quantity: 1,  // Add quantity field
        price: product.price,
        rentalPeriod: {
          startDate,
          endDate
        }
      }));
      
      // Calculate total price
      const totalPrice = items.reduce((sum, item) => {
        const days = Math.ceil((item.rentalPeriod.endDate - item.rentalPeriod.startDate) / (1000 * 60 * 60 * 24));
        return sum + (item.price * days * item.quantity);
      }, 0);
      
      // Create order object
      const order = {
        user: customer._id,
        items,
        totalValue: totalPrice,
        status,
        customerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          idNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
          address: `רחוב ${Math.floor(Math.random() * 100) + 1}, תל אביב`,
          emergencyContact: {
            name: `${hebrewFirstNames[Math.floor(Math.random() * hebrewFirstNames.length)]} ${hebrewLastNames[Math.floor(Math.random() * hebrewLastNames.length)]}`,
            phone: generatePhoneNumber(),
            relationship: ['אח', 'אחות', 'הורה', 'בן/בת זוג', 'חבר'][Math.floor(Math.random() * 5)]
          }
        },
        // Add pickupReturn details
        pickupReturn: {
          pickupAddress: ['רחוב דיזנגוף 50, תל אביב', 'רחוב אלנבי 100, תל אביב', 'רחוב בן יהודה 20, תל אביב'][Math.floor(Math.random() * 3)],
          pickupDate: startDate,
          pickupTime: ['09:00', '10:00', '11:00', '14:00', '15:00'][Math.floor(Math.random() * 5)],
          returnAddress: ['רחוב דיזנגוף 50, תל אביב', 'רחוב אלנבי 100, תל אביב', 'רחוב בן יהודה 20, תל אביב'][Math.floor(Math.random() * 3)],
          returnDate: endDate,
          returnTime: ['17:00', '18:00', '19:00', '20:00'][Math.floor(Math.random() * 4)],
          specialInstructions: Math.random() > 0.7 ? 'אנא התקשרו לפני הגעה' : ''
        },
        // Add contract details
        contract: {
          signed: status !== 'Pending',
          signatureData: status !== 'Pending' ? 'Digital Signature Data' : undefined,
          agreementVersion: '1.0',
          signedAt: status !== 'Pending' ? orderDate : undefined
        },
        // Add ID upload details
        idUpload: {
          uploaded: !!(customer.membership && customer.membership.isMember),
          fileName: customer.membership && customer.membership.isMember ? `ID_${customer.firstName}_${customer.lastName}.jpg` : undefined,
          fileUrl: customer.membership && customer.membership.isMember ? `/uploads/ids/${customer._id}.jpg` : undefined
        },
        // Add payment details
        payment: {
          method: Math.random() > 0.3 ? 'online' : 'cash',
          paymentStatus: status === 'Completed' ? 'completed' : (status === 'PickedUp' || status === 'Accepted' ? 'processing' : 'pending'),
          transactionId: status !== 'Pending' && status !== 'Rejected' ? `TRX${Date.now()}${Math.floor(Math.random() * 1000)}` : undefined,
          paymentDate: status !== 'Pending' && status !== 'Rejected' ? orderDate : undefined,
          cardData: status !== 'Pending' && status !== 'Rejected' && Math.random() > 0.3 ? {
            lastFourDigits: String(Math.floor(Math.random() * 9000) + 1000),
            cardName: `${customer.firstName} ${customer.lastName}`
          } : undefined
        },
        createdAt: orderDate,
        updatedAt: orderDate,
        metadata: {
          statusHistory: [{
            status: 'Pending',
            changedAt: orderDate,
            changedBy: 'System',
            notes: 'Order created'
          }]
        }
      };
      
      // Add status-specific data
      if (status !== 'Pending') {
        const statusChangeDate = new Date(orderDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        order.metadata.statusHistory.push({
          status: status === 'Rejected' ? 'Rejected' : 'Accepted',
          changedAt: statusChangeDate,
          changedBy: adminUser.firstName + ' ' + adminUser.lastName,
          notes: status === 'Rejected' ? 
            ['מוצר לא זמין', 'פרטי לקוח לא תקינים', 'בעיה בתשלום'][Math.floor(Math.random() * 3)] :
            'Order approved'
        });
        order.updatedAt = statusChangeDate;
      }
      
      // Add pickup confirmation for PickedUp and Completed orders
      if (status === 'PickedUp' || status === 'Completed') {
        const pickupDate = new Date(startDate.getTime() + Math.random() * 2 * 60 * 60 * 1000);
        order.pickupConfirmation = {
          confirmedAt: pickupDate,
          confirmedBy: adminUser.firstName + ' ' + adminUser.lastName,
          customerPresent: true,
          membershipVerified: true,
          idVerified: true,
          contractSigned: true,
          paymentReceived: true,
          itemsHandedOut: items.map(item => ({
            productId: item.product,
            productName: selectedProducts.find(p => p._id.equals(item.product))?.name || 'Product',
            condition: 'excellent',
            notes: 'Item in perfect condition'
          })),
          notes: 'Pickup completed successfully'
        };
        
        order.metadata.statusHistory.push({
          status: 'PickedUp',
          changedAt: pickupDate,
          changedBy: adminUser.firstName + ' ' + adminUser.lastName,
          notes: 'Customer picked up items'
        });
        order.updatedAt = pickupDate;
      }
      
      // Add return confirmation for Completed orders
      if (status === 'Completed') {
        const returnDate = new Date(endDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const wasLate = returnDate > endDate;
        const daysDiff = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));
        
        order.returnConfirmation = {
          returnedAt: returnDate,
          returnedBy: adminUser.firstName + ' ' + adminUser.lastName,
          allItemsReturned: true,
          summaryReport: {
            returnConfirmedAt: returnDate,
            returnConfirmedBy: adminUser.firstName + ' ' + adminUser.lastName,
            returnTiming: wasLate ? 'late' : (daysDiff < 0 ? 'early' : 'onTime'),
            daysEarlyLate: daysDiff,
            hoursEarlyLate: Math.abs(Math.ceil((returnDate - endDate) / (1000 * 60 * 60))),
            customerBehavior: {
              punctuality: wasLate ? 'poor' : 'excellent',
              communication: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
              productCare: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
              compliance: 'excellent'
            },
            productsCondition: items.map(item => ({
              productId: item.product,
              productName: selectedProducts.find(p => p._id.equals(item.product))?.name || 'Product',
              conditionOnReturn: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
              requiresMaintenance: Math.random() < 0.1,
              requiresRepair: false,
              isDiscarded: false,
              maintenanceNotes: '',
              repairNotes: '',
              discardReason: '',
              staffNotes: ''
            })),
            overallExperience: ['excellent', 'good', 'satisfactory'][Math.floor(Math.random() * 3)],
            additionalCharges: {
              lateFees: wasLate ? daysDiff * 50 : 0,
              damageFees: 0,
              maintenanceFees: 0,
              replacementFees: 0,
              other: 0,
              otherDescription: ''
            },
            futureRecommendations: {
              approveForFutureRentals: true,
              requiresSpecialAttention: false,
              recommendedCustomerCategory: ['premium', 'standard'][Math.floor(Math.random() * 2)]
            },
            staffNotes: 'Return completed successfully',
            publicNotes: 'Thank you for your rental',
            internalNotes: 'No issues',
            reportGeneratedBy: adminUser.firstName + ' ' + adminUser.lastName,
            reportVersion: '1.0'
          }
        };
        
        order.metadata.statusHistory.push({
          status: 'Completed',
          changedAt: returnDate,
          changedBy: adminUser.firstName + ' ' + adminUser.lastName,
          notes: 'Items returned and order completed'
        });
        order.metadata.completedAt = returnDate;
        order.updatedAt = returnDate;
      }
      
      orders.push(order);
      orderIndex++;
      
      if (orderIndex % 50 === 0) {
        console.log(`   Generated ${orderIndex}/500 orders...`);
      }
    }
  }
  
  await Order.insertMany(orders);
  console.log('✅ 500 orders generated successfully');
  
  // Print distribution summary
  console.log('\n📊 Order Status Distribution:');
  console.log(`   Completed (Archive): ${statusDistribution.Completed} orders`);
  console.log(`   Accepted (Future): ${statusDistribution.Accepted} orders (10 ready for pickup today)`);
  console.log(`   PickedUp (Active): ${statusDistribution.PickedUp} orders (15 due for return today)`);
  console.log(`   Pending: ${statusDistribution.Pending} orders`);
  console.log(`   Rejected: ${statusDistribution.Rejected} orders`);
};

// Main function
const generateRealisticData = async () => {
  console.log('🚀 Starting realistic data generation for Shula Rental System...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearData();
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Generate customers
    const customers = await generateCustomers();
    
    // Get existing products
    const products = await Product.find({});
    if (products.length === 0) {
      console.log('⚠️  No products found in database. Please add products first.');
      process.exit(1);
    }
    console.log(`📦 Found ${products.length} products in database`);
    
    // Generate orders
    await generateOrders(customers, products, adminUser);
    
    console.log('\n🎉 Realistic data generation completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   👤 Admin Users: 1 (+ existing staff)`);
    console.log(`   👥 Customer Users: 150`);
    console.log(`   📦 Orders: 500`);
    console.log(`   🛒 Carts: Cleared`);
    console.log('\n🔐 Admin Login:');
    console.log(`   Email: einat@shula.com`);
    console.log(`   Password: test123`);
    
  } catch (error) {
    console.error('❌ Error generating data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  generateRealisticData();
}

module.exports = { generateRealisticData }; 