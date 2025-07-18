import {
  createOrder as createOrderService,
  getOrderById,
  updateOrderStatus as updateOrderStatusService,
  getCustomerOrders as getCustomerOrdersService,
  trackCourierOrder  as trackUserCourierOrder,
  getAllOrdersWithPopulate as getAllOrdersService,
  getOrderByIdWithPopulate
} from '../services/orderService.js';
import OrderSearchService from '../services/orderSearchService.js';
import mongoose from 'mongoose';

import {
  processPayment as processPaymentService
} from '../services/paymentService.js';

import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const orderService = new OrderSearchService();

export const createOrder = catchAsync(async (req, res, next) => {
  const order = await createOrderService(req.body);
  res.status(201).json({
    success: true,
    data: { order }
  });
});
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getOrder = catchAsync(async (req, res, next) => {
const { id } = req.params;
    if (!isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: 'Invalid order ID format'
    });
  }


  const order = await getOrderById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  res.status(200).json({
    success: true,
    results: 1,
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
    success: true,
    data: { order }
  });
});

export const getCustomerOrders = catchAsync(async (req, res, next) => {
  const orders = await getCustomerOrdersService(req.params.customerId);
  res.status(200).json({
    success: true,
    results: orders.length,
    data: { orders }
  });
});

export const processPayment = catchAsync(async (req, res, next) => {
  const payment = await processPaymentService(req.params.orderId, req.body);
  res.status(201).json({
    success: true,
    data: { payment }
  });
});

export async function getOrderTracking(req, res, next) {
  try {
    const trackingInfo = await trackUserCourierOrder(req.params.orderId);
    res.status(200).json({
      success: true,
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
    if (req.query.status) filters.status = req.query.status;
    if (req.query.canReturn) filters.canReturn = req.query.canReturn;
    // Add other filter keys if needed 
    console.log("filters", filters);

    // Parse include* options from query
    const options = {
      includeItems: req.query.includeItems === 'true',
      includeRefunds: req.query.includeRefunds === 'true',
      includeReturns: req.query.includeReturns === 'true',
      includeCustomer: req.query.includeCustomer === 'true',
      includeShippingAddress: req.query.includeShippingAddress === 'true',
      includePayment: req.query.includePayment === 'true'
    };

    const orders = await getAllOrdersService(filters, options);
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No orders found matching the given criteria.',
      });
    }
    
    res.status(200).json({ success: true, results: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getOrderWithFilters = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse query parameters for what to include
    const options = {
      includeItems: req.query.includeItems === 'true',
      includeRefunds: req.query.includeRefunds === 'true',
      includeReturns: req.query.includeReturns === 'true',
      includeCustomer: req.query.includeCustomer === 'true',
      includeShippingAddress: req.query.includeShippingAddress === 'true',
      includePayment: req.query.includePayment === 'true'
    };

    const order = await getOrderByIdWithPopulate(id, options);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};