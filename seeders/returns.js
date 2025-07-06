import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import connectDB from '../config/db.js';
import Return from '../models/Returns.js';
import Order from '../models/Orders.js';
import Customer from '../models/Customers.js';
import Product from '../models/Products.js';
import Shippings from '../models/Shippings.js';
import Payment from '../models/Payments.js';
import User from '../models/User.js'; // Assuming you have a User model

dotenv.config();

const seedReturns = async () => {
  try {
    await connectDB();

    const users = await User.find();
    const deliveredOrders = await Order.find({ status: 'delivered' }).populate('customer').populate('items.product');

    if (!users.length || deliveredOrders.length < 2) {
      console.error('❌ Not enough users or delivered orders to seed returns');
      process.exit(1);
    }

    await Return.deleteMany();

    const returns = [];

    for (let i = 0; i < 2; i++) {
      const order = deliveredOrders[i];
      const customer = order.customer;
      const processedBy = faker.helpers.arrayElement(users);

      const returnItems = order.items.slice(0, 2).map(item => ({
        product: item.product._id,
        quantity: faker.number.int({ min: 1, max: item.quantity }),
        reason: faker.helpers.arrayElement([
          'Item damaged',
          'Wrong item received',
          'Not satisfied with quality',
          'Late delivery',
        ]),
      }));

      const returnDoc = {
        order: order._id,
        customer: customer._id,
        items: returnItems,
        status: 'initiated',
        statusHistory: [
          {
            previousStatus: 'initiated',
            newStatus: 'initiated',
            processedBy: processedBy._id,
            notes: 'Return request created via seed script',
            actionTaken: 'Customer initiated return',
            processedAt: new Date(),
          },
        ],
        createdAt: faker.date.recent(5),
      };

      returns.push(returnDoc);
    }

    await Return.insertMany(returns);

    console.log('✅ Seeded 2 returns for delivered orders');
    process.exit(0);
  } catch (err) {
    console.error('❌ Return seeding failed:', err);
    process.exit(1);
  }
};

seedReturns();
