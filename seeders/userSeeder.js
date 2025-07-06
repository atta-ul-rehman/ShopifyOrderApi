// seeders/userSeeder.js
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany();

    const roles = ['admin', 'superadmin', 'agent', 'developer'];

    const users = Array.from({ length: 5 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number('+92##########'),
      role: faker.helpers.arrayElement(roles),
      password: '12345678', // In production, hash this!
    }));

    await User.insertMany(users);
    console.log(`✅ Seeded ${users.length} users`);
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
