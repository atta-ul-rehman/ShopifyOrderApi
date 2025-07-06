import {
  processPayment as processPaymentService,
  getPaymentById as getPaymentByIdService,
  refundPayment as refundPaymentService,
  processPayment as getAllPaymentsService
} from '../services/paymentService.js';

import catchAsync from '../utils/catchAsync.js';

export const processPayment = catchAsync(async (req, res, next) => {
  const payment = await processPaymentService(req.params.orderId, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      payment
    }
  });
});

export const getPayment = catchAsync(async (req, res, next) => {
  const payment = await getPaymentByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

export const processRefund = catchAsync(async (req, res, next) => {
  const payment = await refundPaymentService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

export const getAllPayments = catchAsync(async (req, res, next) => {
  const payments = await getAllPaymentsService(req.query);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments
    }
  });
});
