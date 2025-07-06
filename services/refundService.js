// services/refundService.js
import Refund from '../models/Refunds.js';
import Order from '../models/Orders.js';
import Customer from '../models/Customers.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
const { Types } = mongoose;

export const createRefund = async (refundData) => {
  const { order, customer, processedBy ,status = 'requested', notes  } = refundData;

  const orderExists = await Order.findById(order);
  if (!orderExists) throw new AppError('Order not found', 400);

  const customerExists = await Customer.findById(customer);
  if (!customerExists) throw new AppError('Customer not found', 400);

  if (processedBy) {
    const userExists = await User.findById(processedBy);
    if (!userExists) throw new AppError('ProcessedBy (User) not found', 400);
  }
    const existingRefund = await Refund.findOne({
    order,
    customer,
    status: { $ne: 'processed' },
  });

  if (existingRefund) {
    throw new AppError(
      'A refund for this order, customer, and processor already exists and is not yet processed.',
      400
    );
  }
const noteFromHistory = refundData.statusHistory?.[0]?.notes || '';
   const statusHistory = [
    {
      previousStatus: status,
      newStatus: status,
      processedBy: refundData.statusHistory?.[0]?.processedBy,
      processedAt: new Date(),
      notes: noteFromHistory || '',
      actionTaken: `Initial status set to ${status}`,
    },
  ];

  return await Refund.create({
    ...refundData,
    status,
    statusHistory,
  });
};

export const getRefundById = async (id, populateFields = []) => {
  let query = Refund.findById(id);
  populateFields.forEach(field => query = query.populate(field));
  query = query.populate('statusHistory.processedBy');
  return await query;
};

export const getAllRefunds = async (filters = {}, populateFields = []) => {
  let query = Refund.find(filters);
  populateFields.forEach(field => query = query.populate(field));
  query = query.populate('statusHistory.processedBy');
  return await query;
};

export const updateRefundStatus = async (id, updateData) => {
  const refund = await Refund.findById(id);
  if (!refund) throw new AppError('Refund not found', 404);

  const prevStatus = refund.status;
  const newStatus = updateData.status || prevStatus;
  if (!newStatus) {
    throw new AppError('New status is required for update', 400);
  }
  // Create the action description
  const actionTaken = `Changed status from ${prevStatus} to ${newStatus}`;
  const allowedTransitions = {
  requested: ['approved', 'rejected'],
  approved: ['processed'],
  rejected: ['processed'],
  processed: [], // Final state
  };

  if (prevStatus === newStatus) {
    throw new AppError(`Status is already '${prevStatus}'. Cannot update to the same status.`, 400);
  }

  if (!allowedTransitions[prevStatus]?.includes(newStatus)) {
    throw new AppError(`Cannot change status from '${prevStatus}' to '${newStatus}'`, 400);
  }

  // Add a new status history record
  refund.statusHistory.push({
    previousStatus: prevStatus,
    newStatus,
    processedBy: updateData.statusHistory?.[0]?.processedBy,
    processedAt: new Date(),
    notes: updateData.statusHistory?.[0]?.notes || '',
    actionTaken,
  });

  // Update main refund fields
  refund.status = newStatus;
  if (updateData.notes !== undefined) {
    refund.notes = updateData.notes;
  }
  return await refund.save();
};

export const deleteRefund = async (id) => {
  return await Refund.findByIdAndDelete(id);
};
