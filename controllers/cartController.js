import {
  getCartByCustomer as getCartByCustomerService,
  addItemToCart as addItemToCartService,
  updateCartItem as updateCartItemService,
  removeItemFromCart as removeItemFromCartService,
  clearCart as clearCartService
} from '../services/cartService.js';

import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getCart = catchAsync(async (req, res, next) => {
  const cart = await getCartByCustomerService(req.params.customerId);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const addToCart = catchAsync(async (req, res, next) => {
  const cart = await addItemToCartService(
    req.params.customerId,
    req.body.productId,
    req.body.quantity
  );
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const cart = await updateCartItemService(
    req.params.customerId,
    req.body.productId,
    req.body.quantity
  );
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await removeItemFromCartService(
    req.params.customerId,
    req.params.productId
  );
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const clearCart = catchAsync(async (req, res, next) => {
  const cart = await clearCartService(req.params.customerId);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});
