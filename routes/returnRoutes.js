// routes/returnRoutes.js
import express from 'express';
import {
  initiateReturn,
  getReturn,
  changeReturnStatus,
  getCustomerReturns,
  getOrderReturns,
  getOrderReturnSummary
} from '../controllers/returnController.js';

const router = express.Router();

router.post('/', initiateReturn);
router.get('/:id', getReturn);
router.patch('/:id/status', changeReturnStatus);
router.get('/customer/:customerId', getCustomerReturns);
router.get('/order/:orderId', getOrderReturns); 
router.get('/order/:orderId/summary', getOrderReturnSummary);
export default router;
