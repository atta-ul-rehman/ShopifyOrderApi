import {
  createOrder as createOrderService,
  getOrderById,
  updateOrderStatus as updateOrderStatusService,
  getCustomerOrders as getCustomerOrdersService,
  trackCourierOrder  as trackUserCourierOrder,
  getAllOrders as getAllOrdersService
} from '../services/orderService.js';
import mongoose from 'mongoose';

import {
  processPayment as processPaymentService
} from '../services/paymentService.js';

import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const createOrder = catchAsync(async (req, res, next) => {
  const order = await createOrderService(req.body);
  res.status(201).json({
    status: 'success',
    data: { order }
  });
});
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getOrder = catchAsync(async (req, res, next) => {
const { id } = req.params;
    if (!isValidObjectId(id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid order ID format'
    });
  }


  const order = await getOrderById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await updateOrderStatusService(
    req.params.id,
    req.body.status,
    req.user ? req.user.id : 'system',
    req.body.note
  );
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const getCustomerOrders = catchAsync(async (req, res, next) => {
  const orders = await getCustomerOrdersService(req.params.customerId);
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

export const processPayment = catchAsync(async (req, res, next) => {
  const payment = await processPaymentService(req.params.orderId, req.body);
  res.status(201).json({
    status: 'success',
    data: { payment }
  });
});

export async function getOrderTracking(req, res, next) {
  try {
    const trackingInfo = await trackUserCourierOrder(req.params.orderId);
    res.status(200).json({
      status: 'success',
      data: trackingInfo,
    });
  } catch (err) {
    next(err);
  }
}
export const getAllOrders = async (req, res) => {
  try {
    const filters = {};

    if (req.query.email) filters['shippingAddress.email'] = req.query.email;
    if (req.query.phone) filters['shippingAddress.phone'] = req.query.phone;
    if (req.query.customer) filters.customer = req.query.customer;
    // Add other filter keys if needed 
   console.log("filters", filters);
    const orders = await getAllOrdersService(filters);

    res.status(200).json({ success: true, results: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
