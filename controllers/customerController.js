import {
  getAllCustomers as getAllCustomersService,
  getCustomerById as getCustomerByIdService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService
} from '../services/customerService.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await getAllCustomersService(req.query);
  res.status(200).json({
    status: 'success',
    results: customers.length,
    data: {
      customers
    }
  });
});

export const getCustomer = catchAsync(async (req, res, next) => {
  const customer = await getCustomerByIdService(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      customer
    }
  });
});

export const updateCustomer = catchAsync(async (req, res, next) => {
  const customer = await updateCustomerService(
    req.params.id,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: {
      customer
    }
  });
});

export const deleteCustomer = catchAsync(async (req, res, next) => {
  await deleteCustomerService(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});