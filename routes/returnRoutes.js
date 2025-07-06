// routes/returnRoutes.js
import express from 'express';
import {
  initiateReturn,
  getReturn,
  changeReturnStatus,
  getCustomerReturns
} from '../controllers/returnController.js';

const router = express.Router();

router.post('/', initiateReturn);
router.get('/:id', getReturn);
router.patch('/:id/status', changeReturnStatus);
router.get('/customer/:customerId', getCustomerReturns);

export default router;
