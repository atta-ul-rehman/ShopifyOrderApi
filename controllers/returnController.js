import {
  createReturn,
  getReturnById,
  updateReturnStatus,
  getReturnsByCustomer
} from '../services/returnService.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const initiateReturn = catchAsync(async (req, res, next) => {
  const newReturn = await createReturn(req.body, req.user?.id);
  res.status(201).json({
    status: 'success',
    data: { return: newReturn },
  });
});

export const getReturn = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid return ID' });
  }

  const ret = await getReturnById(id);
  res.status(200).json({
    status: 'success',
    data: { return: ret },
  });
});

export const changeReturnStatus = catchAsync(async (req, res, next) => {
  const updatedReturn = await updateReturnStatus(
    req.params.id,
    req.body.status,
    req.user?.id,
    req.body.note
  );

  res.status(200).json({
    status: 'success',
    data: { return: updatedReturn },
  });
});

export const getCustomerReturns = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const returns = await getReturnsByCustomer(customerId);

  res.status(200).json({
    status: 'success',
    results: returns.length,
    data: { returns },
  });
});
