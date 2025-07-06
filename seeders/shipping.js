import { validCities } from '../utils/locations.js';
import {faker} from '@faker-js/faker';
import Customer from '../models/Customers.js';  // Adjust path as needed
import Shipping from '../models/Shippings.js';  // Adjust path as needed
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to database
connectDB();

const generatePakistaniPhoneNumber = () => {
  const mobilePrefixes = ['0300', '0301', '0302', '0310', '0321', '0333', '0345', '0355'];
  const prefix = faker.helpers.arrayElement(mobilePrefixes);
  const lineNumber = faker.string.numeric(7); // 7-digit number
  return `${prefix}${lineNumber}`;
};

const seedShipping = async () => {
  const customers = await Customer.find();

  await Shipping.deleteMany();

  const docs = customers.map(c => {
    const city = faker.helpers.arrayElement(validCities);
    return {
      customer: c._id,
      address: `${faker.location.streetAddress()}, ${city}`,
      city,
      state: 'Punjab',
      country: 'Pakistan',
      postalCode: faker.string.numeric(5),  // Consider validating this separately
      isDefault: faker.datatype.boolean(),
      email: faker.internet.email({ firstName: c.firstName || 'john', lastName: c.lastName || 'doe' }),
      phone: generatePakistaniPhoneNumber(),    
      isValidated: true,
      validationResult: { verified: true }
    };
  });

  await Shipping.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} shipping addresses`);
  process.exit();
};

seedShipping();
