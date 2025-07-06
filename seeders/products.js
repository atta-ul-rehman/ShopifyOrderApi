import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Products.js';
import Category from '../models/Category.js';
import { faker } from '@faker-js/faker';

dotenv.config();
await connectDB();

const seedProducts = async () => {
  try {
    const categories = await Category.find();

    if (!categories.length) {
      console.error('❌ No categories found. Seed categories first.');
      process.exit(1);
    }

    await Product.deleteMany();

    const products = [];

    for (let i = 0; i < 20; i++) {
      const randomCategories = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 3 }));

      products.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price(1, 1000, 2)),
        stock: faker.number.int({ min: 0, max: 500 }),
        images: [
          faker.image.urlLoremFlickr({ category: 'technology', width: 640, height: 480 }),
          faker.image.urlLoremFlickr({ category: 'business', width: 640, height: 480 }),
        ],
        categories: randomCategories.map(c => c._id),
        averageRating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        numReviews: faker.number.int({ min: 0, max: 100 }),
      });
    }

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);
    process.exit();
  } catch (error) {
    console.error('❌ Product seeding failed:', error);
    process.exit(1);
  }
};

seedProducts();
