import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Customer from '../models/Customers.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

/**
 * @desc    Sign JWT token
 * @param   {String} id - Customer ID
 * @returns {String} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * @desc    Create and send JWT token
 * @param   {Object} customer - Customer object
 * @param   {Number} statusCode - HTTP status code
 * @param   {Object} res - Express response object
 */
const createSendToken = (customer, statusCode, res) => {
  const token = signToken(customer._id);

  // Remove password from output
  customer.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      customer
    }
  });
};

/**
 * @desc    Register new customer
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, password, passwordConfirm } = req.body;

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return next(new AppError('Customer with this email already exists', 400));
  }

  const newCustomer = await Customer.create({
    name,
    email,
    phone,
    address,
    password,
    passwordConfirm,
    isRegistered: true
  });

  createSendToken(newCustomer, 201, res);
});

/**
 * @desc    Login customer
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if customer exists and password is correct
  const customer = await Customer.findOne({ email }).select('+password');

  if (!customer || !(await customer.correctPassword(password, customer.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(customer, 200, res);
});

/**
 * @desc    Protect routes - require logged in customer
 * @middleware
 */
export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

  // 3) Check if customer still exists
  const currentCustomer = await Customer.findById(decoded.id);
  if (!currentCustomer) {
    return next(
      new AppError('The customer belonging to this token does no longer exist.', 401)
    );
  }

  // 4) Check if customer changed password after the token was issued
  if (currentCustomer.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Customer recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.customer = currentCustomer;
  next();
});

/**
 * @desc    Restrict routes to specific roles
 * @param   {...String} roles - Allowed roles
 * @middleware
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.customer.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * @desc    Update customer password
 * @route   PATCH /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get customer from collection
  const customer = await Customer.findById(req.customer.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await customer.correctPassword(req.body.currentPassword, customer.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  customer.password = req.body.newPassword;
  customer.passwordConfirm = req.body.newPasswordConfirm;
  await customer.save();

  // 4) Log customer in, send JWT
  createSendToken(customer, 200, res);
});
