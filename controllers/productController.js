import {
  createProduct as createProductService,
  getAllProducts as getAllProductsService,
  getProductById as getProductByIdService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService
} from '../services/productService.js';

import catchAsync from '../utils/catchAsync.js';

export const createProduct = catchAsync(async (req, res, next) => {
  const product = await createProductService(req.body);
  res.status(201).json({ success: true, data: product });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await getAllProductsService();
  res.status(200).json({ success: true, data: products });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const product = await getProductByIdService(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const updated = await updateProductService(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, data: updated });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const deleted = await deleteProductService(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(204).send(); // No content
});
