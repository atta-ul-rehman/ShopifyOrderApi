import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Refund from '../models/Refunds.js';
import Order from '../models/Orders.js';
import Customer from '../models/Customers.js';
import User from '../models/User.js'; // If you're using Customer as User
import Product from '../models/Products.js'; // ✅ Add this
import Shipping from '../models/Shippings.js'; // ✅ Add this
import Payment from '../models/Payments.js'; // ✅ Add this
import Return from '../models/Returns.js'; // ✅ Add this
import connectDB from '../config/db.js';


dotenv.config();


const seedRefunds = async () => {
  try {
    await connectDB();
    
    const orders = await Order.find().limit(4);
    const customers = await Customer.find();
    const users = await User.find();
    
    if (orders.length < 4 || customers.length === 0 || users.length === 0) {
      console.error('❌ Not enough data to seed refunds (orders/customers/users missing)');
      process.exit(1);
    }
    
    await Refund.deleteMany();
    
    // Define statuses: 2 processed, 1 approved, 1 requested
    const statuses = ['processed', 'processed', 'approved', 'requested'];
    
    // Sample receipt images for processed refunds
    const receiptImages = [
      'https://example.com/receipts/refund_receipt_001.jpg',
      'https://example.com/receipts/refund_receipt_002.jpg',
      'https://example.com/receipts/refund_receipt_003.jpg',
      'https://example.com/receipts/refund_receipt_004.jpg'
    ];
    
    const refunds = orders.map((order, i) => {
      const status = statuses[i];
      const user = faker.helpers.arrayElement(users);
      const processedAt = ['approved', 'rejected', 'processed'].includes(status) 
        ? faker.date.recent() 
        : null;
      
      const refundData = {
        order: order._id,
        customer: order.customer,
        amount: faker.number.int({ min: 100, max: 1000 }),
        reason: faker.helpers.arrayElement([
          'Product arrived damaged',
          'Wrong item received',
          'Product not as described',
          'Changed mind about purchase',
          'Product defective',
          'Late delivery'
        ]),
        status,
        notes: faker.lorem.sentence(),
        statusHistory: [
          {
            previousStatus: 'requested',
            newStatus: status,
            processedBy: user._id,
            processedAt: processedAt || faker.date.recent(),
            notes: faker.lorem.sentence(),
            actionTaken: `Initial status set to ${status}`,
          },
        ],
      };
      
      // Add processedAt if status requires it
      if (processedAt) {
        refundData.processedAt = processedAt;
      }
      
      // Add receipt image only for processed refunds
      if (status === 'processed') {
        refundData.receiptImage = receiptImages[i];
      }
      
      return refundData;
    });
    
    await Refund.insertMany(refunds);
    
    console.log(`✅ Seeded ${refunds.length} refunds`);
    console.log('📊 Refund Status Distribution:');
    console.log(`   - Processed: ${refunds.filter(r => r.status === 'processed').length} (with receipt images)`);
    console.log(`   - Approved: ${refunds.filter(r => r.status === 'approved').length}`);
    console.log(`   - Requested: ${refunds.filter(r => r.status === 'requested').length}`);
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding refunds:', error);
    process.exit(1);
  }
};

seedRefunds();