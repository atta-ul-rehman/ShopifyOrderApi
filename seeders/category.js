import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Category from '../models/Category.js'; // Adjust if needed
import slugify from 'slugify';

dotenv.config();
await connectDB();

const seedCategories = async () => {
  try {
    await Category.deleteMany();

    const categories = [];

    const sampleNames = [
      'Electronics',
      'Fashion',
      'Home & Kitchen',
      'Books',
      'Toys & Games',
      'Sports',
      'Beauty & Personal Care',
      'Automotive',
      'Health',
      'Grocery'
    ];

    for (let name of sampleNames) {
      categories.push({
        name,
        slug: slugify(name, { lower: true }),
        description: faker.commerce.productDescription(),
      });
    }

    await Category.insertMany(categories);
    console.log(`✅ Seeded ${categories.length} categories`);
    process.exit();
  } catch (err) {
    console.error('❌ Category seeding failed:', err);
    process.exit(1);
  }
};

seedCategories();
