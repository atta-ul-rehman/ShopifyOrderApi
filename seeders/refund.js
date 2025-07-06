import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Refund from '../models/Refunds.js';
import Order from '../models/Orders.js';
import Customer from '../models/Customers.js';
import User from '../models/User.js'; // If you're using Customer as User
import Product from '../models/Products.js'; // ✅ Add this
import Shipping from '../models/Shippings.js'; // ✅ Add this
import Payment from '../models/Payments.js'; // ✅ Add this
import connectDB from '../config/db.js';


dotenv.config();

const seedRefunds = async () => {
  try {
    await connectDB();

    const orders = await Order.find().limit(5);
    const customers = await Customer.find();
    const users = await User.find();

    if (orders.length < 5 || customers.length === 0 || users.length === 0) {
      console.error('❌ Not enough data to seed refunds (orders/customers/users missing)');
      process.exit(1);
    }

    await Refund.deleteMany();

    const statuses = ['requested', 'approved', 'rejected', 'processed', 'processed'];

    const refunds = orders.map((order, i) => {
      const status = statuses[i];
      const user = ['approved', 'rejected', 'processed'].includes(status)
        ? faker.helpers.arrayElement(users)
        : faker.helpers.arrayElement(users); // even for 'requested', assign a processor for seeding

      const processedAt = faker.date.recent();

      return {
        order: order._id,
        customer: order.customer,
        amount: faker.number.int({ min: 100, max: 1000 }),
        reason: faker.lorem.sentence(),
        status,
        notes: faker.lorem.sentence(),
        statusHistory: [
          {
            previousStatus: 'requested', // assuming this is always the first step
            newStatus: status,
            processedBy: user._id,
            processedAt,
            notes: faker.lorem.sentence(),
            actionTaken: `Initial status set to ${status}`,
          },
        ],
      };
    });

    await Refund.insertMany(refunds);
    console.log(`✅ Seeded ${refunds.length} refunds`);
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding refunds:', error);
    process.exit(1);
  }
};

seedRefunds();
