import Payment from '../models/Payments.js';
import Order from '../models/Orders.js';
import AppError from '../utils/appError.js';

export async function processPayment(orderId, paymentData) {
  // In a real app, integrate with payment gateway
  // Here we simulate with 80% success rate

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }

  const isSuccess = Math.random() < 0.8;
  const status = isSuccess ? 'success' : 'failed';

  const payment = await Payment.create({
    order: orderId,
    amount: order.totalAmount,
    method: paymentData.method,
    status,
    transactionId: `TXN-${Date.now()}`,
    paymentDetails: paymentData.details || {},
  });

  return payment;
}

export async function getPaymentById(paymentId) {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('No payment found with that ID', 404);
  }
  return payment;
}

export async function refundPayment(paymentId, refundData) {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('No payment found with that ID', 404);
  }

  if (payment.status !== 'success') {
    throw new AppError('Only successful payments can be refunded', 400);
  }

  payment.status = 'refunded';
  // Optionally save refund info if needed: refundData
  await payment.save();

  return payment;
}
