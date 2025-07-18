import { Router } from 'express';
import { createOrder, getOrder, updateOrderStatus, getCustomerOrders, getOrderTracking, getAllOrders, getOrderWithFilters } from '../controllers/orderController.js';
import { processPayment } from '../controllers/paymentController.js';

const router = Router();

router
  .route('/customer/:customerId')
  .get(getCustomerOrders);

router
  .route('/:orderId/payments')
  .post(processPayment);

router
  .route('/:id')
  .get(getOrderWithFilters)
  .patch(updateOrderStatus);
router
  .route('/:orderId/tracking')
  .get(getOrderTracking); 
router
  .route('/')
  .post(createOrder)
  .get(getAllOrders); 

export default router;