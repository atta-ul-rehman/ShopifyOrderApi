import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker'; // or '@faker-js/faker' depending on your setup
import Review from '../models/Reviews.js';
import Product from '../models/Products.js';
import Customer from '../models/Customers.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedReviews = async () => {
  try {
    await connectDB();

    const products = await Product.find();
    const customers = await Customer.find();

    if (products.length === 0 || customers.length === 0) {
      console.error('No products or customers found. Cannot seed reviews.');
      process.exit(1);
    }

    await Review.deleteMany();

    const reviews = [];

    for (let i = 0; i < 30; i++) {
      const product = faker.helpers.arrayElement(products);
      const customer = faker.helpers.arrayElement(customers);

      // Avoid duplicate reviews - skip if exists
      const existingReview = await Review.findOne({ product: product._id, customer: customer._id });
      if (existingReview) {
        i--; // retry this iteration with different customer/product
        continue;
      }

      reviews.push({
        product: product._id,
        customer: customer._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      });
    }

    await Review.insertMany(reviews);

    console.log(`✅ Seeded ${reviews.length} reviews`);

    process.exit();
  } catch (err) {
    console.error('Error seeding reviews:', err);
    process.exit(1);
  }
};

seedReviews();
