import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Order from '../models/Orders.js';
import Payment from '../models/Payments.js';
import Customer from '../models/Customers.js';     // <-- Must import!
import Shipping from '../models/Shippings.js';    // If referenced
import Product from '../models/Products.js';      // If referenced
import crypto from 'crypto'; 
dotenv.config();
await connectDB();

const seedPayments = async () => {
  try {
    const orders = await Order.find();

    if (!orders.length) {
      console.log('❌ No orders found. Cannot seed payments.');
      process.exit(1);
    }

    await Payment.deleteMany();

    const payments = orders.map(order => {
      const method = faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cod']);
      const status = faker.helpers.arrayElement(['pending', 'success', 'failed', 'refunded']);

      return {
        order: order._id,
        amount: faker.number.int({ min: 500, max: 20000 }),
        method,
        status,
        transactionId: crypto.randomBytes(6).toString('hex').toUpperCase(), // ✅ Generate unique ID
        paymentDetails: {
          accountHolder: faker.person.fullName(),
          provider: faker.company.name(),
          timestamp: new Date()
        }
      };
    });

    const createdPayments = await Payment.insertMany(payments);

    for (const payment of createdPayments) {
      await Order.findByIdAndUpdate(payment.order, { payment: payment._id });
    }

    console.log(`✅ Seeded ${createdPayments.length} payments`);
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding payments:', err);
    process.exit(1);
  }
};

seedPayments();
