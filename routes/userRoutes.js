import express from 'express';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/')
  .get(getAllUsersController)
  .post(createUserController);

router.route('/:id')
  .get(getUserByIdController)
  .delete(deleteUserController);

export default router;
