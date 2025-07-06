import { Router } from 'express';
import { getAllPayments, getPayment, processRefund } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = Router();

// router.use(protect);

router
  .route('/')
  .get(restrictTo('admin'), getAllPayments);

router
  .route('/:id')
  .get(restrictTo('admin'), getPayment);

router
  .route('/:id/refund')
  .post(restrictTo('admin'), processRefund);

export default router;