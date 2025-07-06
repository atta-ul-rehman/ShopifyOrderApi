import Cart from '../models/Cart.js';
import Product from '../models/Products.js'; // Ensure your model file is named properly
import AppError from '../utils/appError.js';

export async function getCartByCustomer(customerId) {
  let cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }

  return cart;
}

export async function addItemToCart(customerId, productId, quantity = 1) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('No product found with that ID', 404);
  }

  let cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  await cart.save();
  return cart;
}

export async function updateCartItem(customerId, productId, quantity) {
  if (quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  const cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    throw new AppError('No cart found for this customer', 404);
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new AppError('Product not found in cart', 404);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  return cart;
}

export async function removeItemFromCart(customerId, productId) {
  const cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    throw new AppError('No cart found for this customer', 404);
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId.toString()
  );

  await cart.save();
  return cart;
}

export async function clearCart(customerId) {
  const cart = await Cart.findOneAndUpdate(
    { customer: customerId },
    { items: [] },
    { new: true }
  );

  if (!cart) {
    throw new AppError('No cart found for this customer', 404);
  }

  return cart;
}
