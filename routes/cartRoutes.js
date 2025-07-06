import { Router } from 'express';
import { getCart, clearCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController.js';

const router = Router();

router
  .route('/:customerId')
  .get(getCart)
  .delete(clearCart);

router
  .route('/:customerId/items')
  .post(addToCart)
  .patch(updateCartItem);

router
  .route('/:customerId/items/:productId')
  .delete(removeFromCart);

export default router;