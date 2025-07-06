import {
  createRefund as createRefundService,
  getRefundById as getRefundByIdService,
  getAllRefunds as getAllRefundsService,
  updateRefundStatus as updateRefundStatusService,
  deleteRefund as deleteRefundService
} from '../services/refundService.js';

import catchAsync from '../utils/catchAsync.js';

export const createRefund = catchAsync(async (req, res) => {
  const refund = await createRefundService(req.body);
  res.status(201).json({ success: true, data: refund });
});

export const getRefundById = catchAsync(async (req, res) => {
  const populateFields = req.query.populate?.split(',') || [];
  const refund = await getRefundByIdService(req.params.id, populateFields);
  if (!refund) {
    return res.status(404).json({ success: false, message: 'Refund not found' });
  }
  res.status(200).json({ success: true, data: refund });
});

export const getAllRefunds = catchAsync(async (req, res) => {
   const { order, customer, processedBy } = req.query;

  const filters = {};
  if (order) filters.order = order;
  if (customer) filters.customer = customer;
  if (processedBy) filters['statusHistory.processedBy'] = processedBy;

  const populateFields = req.query.populate?.split(',') || [];
  const refunds = await getAllRefundsService(filters, populateFields);
  res.status(200).json({ success: true, results: refunds.length, data: refunds });
});

export const updateRefundStatus = catchAsync(async (req, res) => {
  const refund = await updateRefundStatusService(req.params.id, req.body);
  if (!refund) {
    return res.status(404).json({ success: false, message: 'Refund not found' });
  }
  res.status(200).json({ success: true, data: refund });
});

export const deleteRefund = catchAsync(async (req, res) => {
  const deleted = await deleteRefundService(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Refund not found' });
  }
  res.status(204).send();
});
// Get refunds by customer ID
export const getRefundsByCustomer = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const refunds = await getAllRefundsService({ customer: customerId });

  res.status(200).json({
    status: 'success',
    results: refunds.length,
    data: { refunds }
  });
});