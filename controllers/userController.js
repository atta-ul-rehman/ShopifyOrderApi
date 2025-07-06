// controllers/userController.js
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUserById,
} from '../services/userService.js';

export const createUserController = async (req, res, next) => {
  const user = await createUser(req.body);
  res.status(201).json({ status: 'success', data: { user } });
};

export const getAllUsersController = async (req, res, next) => {
  const users = await getAllUsers();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
};

export const getUserByIdController = async (req, res, next) => {
  const user = await getUserById(req.params.id);
  res.status(200).json({ status: 'success', data: { user } });
};

export const deleteUserController = async (req, res, next) => {
  await deleteUserById(req.params.id);
  res.status(204).json({ status: 'success', data: null });
};
