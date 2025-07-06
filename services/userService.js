// services/userService.js

import User from '../models/User.js';
import AppError from '../utils/appError.js';

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  return await User.create(userData);
};

/**
 * Get all users
 */
export const getAllUsers = async (filter = {}) => {
  return await User.find(filter);
};

/**
 * Get a user by ID
 */
export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Delete a user by ID
 */
export const deleteUserById = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
