import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Customer from '../models/Customers.js'; // adjust path as needed
import bcrypt from 'bcryptjs';
dotenv.config();

// Connect to DB
import connectDB from '../config/db.js';

// Connect to database
connectDB();
console.log('🟢 Connected to MongoDB');

const generatePakPhone = () => {
  const prefix = faker.helpers.arrayElement(['030', '031', '032', '033', '034']);
  const number = faker.string.numeric(8);
  return `${prefix}${number}`;
};

// Generate fake customers
const createFakeCustomer = async () => {
  const password = await bcrypt.hash('test1234', 12);

  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: generatePakPhone(),
   
    isRegistered: true,
    password: password,
    role: 'user',
    createdAt: new Date()
  };
};

// Seed function
const seedCustomers = async (num = 10) => {
  try {
    await Customer.deleteMany(); // Optional: Clean existing data
    const fakeCustomers = [];

    for (let i = 0; i < num; i++) {
      fakeCustomers.push(await createFakeCustomer());
    }

    await Customer.insertMany(fakeCustomers);
    console.log(`✅ Seeded ${num} customers`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedCustomers(20); // change number of customers as needed
