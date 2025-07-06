import Product from '../models/Products.js';

export async function createProduct(data) {
  return await Product.create(data);
}

export async function getAllProducts() {
  return await Product.find().populate('categories');
}

export async function getProductById(id) {
  return await Product.findById(id).populate('categories');
}

export async function updateProduct(id, data) {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteProduct(id) {
  return await Product.findByIdAndDelete(id);
}
