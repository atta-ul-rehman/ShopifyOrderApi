import express from 'express';
import {
  createRefund,
  getRefundById,
  getAllRefunds,
  updateRefundStatus,
  deleteRefund,
  getRefundsByCustomer
} from '../controllers/refundController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllRefunds)
  .post(createRefund);

router
  .route('/customer/:customerId')
  .get(getRefundsByCustomer);

router
  .route('/:id')
  .get(getRefundById)
  .patch(updateRefundStatus)
  .delete(deleteRefund);

export default router;
