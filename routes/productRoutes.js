import { Router } from 'express';
const router = Router();
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';

// Routes for product CRUD
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
