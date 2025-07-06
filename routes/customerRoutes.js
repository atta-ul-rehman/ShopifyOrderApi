import { Router } from 'express';
import { getAllCustomers, getCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = Router();

router
  .route('/')
  .get(getAllCustomers);

router
  .route('/:id')
  .get(getCustomer)
  .patch(updateCustomer)
  .delete(deleteCustomer);

export default router;