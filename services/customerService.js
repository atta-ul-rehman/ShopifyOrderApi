import Customer from '../models/Customers.js'; // Correct the filename and import

import AppError from '../utils/appError.js';

export async function createCustomer(customerData) {
  const existingCustomer = await Customer.findOne({
    $or: [
      { email: customerData.email },
      { phone: customerData.phone }
    ]
  });

  if (existingCustomer) {
    return existingCustomer;
  }

  const newCustomer = await Customer.create({
    ...customerData,
    isRegistered: false
  });

  return newCustomer;
}

export async function getCustomerById(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('No customer found with that ID', 404);
  }
  return customer;
}

export async function updateCustomer(customerId, updateData) {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!customer) {
    throw new AppError('No customer found with that ID', 404);
  }

  return customer;
}

export async function deleteCustomer(customerId) {
  const customer = await Customer.findByIdAndDelete(customerId);
  if (!customer) {
    throw new AppError('No customer found with that ID', 404);
  }
  return customer;
}

export async function getAllCustomers(query = {}) {
  const customers = await Customer.find(query);
  return customers;
}
