import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Order from '../models/Orders.js';
import Customer from '../models/Customers.js';
import Product from '../models/Products.js';
import Shipping from '../models/Shippings.js';
import Payment from '../models/Payments.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedOrders = async () => {
  try {
    await connectDB();

    const customers = await Customer.find();
    const products = await Product.find();
    const shippings = await Shipping.find();
    const payments = await Payment.find();

    if (!customers.length || !products.length || !shippings.length) {
      console.error('❌ Not enough data (customers/products/shippings) to seed orders.');
      process.exit(1);
    }

    await Order.deleteMany();

    const orders = [];

    for (let i = 0; i < 20; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const shipping = faker.helpers.arrayElement(
        shippings.filter(s => s.customer.toString() === customer._id.toString())
      );

      if (!shipping) continue; // Skip if no shipping for that customer

      const numberOfItems = faker.number.int({ min: 1, max: 5 });
      const items = [];

      for (let j = 0; j < numberOfItems; j++) {
        const product = faker.helpers.arrayElement(products);
        const quantity = faker.number.int({ min: 1, max: 5 });
        items.push({
          product: product._id,
          quantity,
          price: product.price,
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const hasPayment = faker.datatype.boolean();
      const payment = hasPayment && payments.length ? faker.helpers.arrayElement(payments) : null;
      const status = payment ? faker.helpers.arrayElement(['paid', 'shipped', 'delivered']) : 'pending';
     const trackingNumber = faker.number.int({ min: 2410000000000, max: 2410999999999 }).toString();

      // Random delivery info for shipped or delivered orders
      const deliveryInfo = ['shipped', 'delivered'].includes(status)
        ? {
            courierCompany: 'PostEx',
            trackingNumber,
            trackingUrl: 'https://api.postex.pk/services/courier/api/guest/get-order/' + trackingNumber,
            shippedAt: faker.date.recent(5),
            estimatedDelivery: faker.date.soon(7),
          }
        : undefined;

      const riderNote = status === 'delivered' ? '' :
        faker.datatype.boolean() ? faker.lorem.sentence() : '';

      orders.push({
        customer: customer._id,
        items,
        shippingAddress: shipping._id,
        payment: payment?._id || null,
        status,
        statusHistory: [
          {
            status,
            changedAt: new Date(),
            changedBy: 'system',
            note: 'Auto status during seeding',
          },
        ],
        totalAmount,
        isFraudulent: false,
        deliveryInfo,
        riderNote,
        createdAt: faker.date.recent(30),
      });
    }

    await Order.insertMany(orders);
    console.log('✅ Seeded 20 orders with delivery info, status history, and optional rider notes');

    process.exit();
  } catch (error) {
    console.error('❌ Order seeding failed:', error);
    process.exit(1);
  }
};

seedOrders();
