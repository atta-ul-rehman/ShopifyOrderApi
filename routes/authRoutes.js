import { Router } from 'express';
import { register, login, protect, updatePassword } from '../controllers/authController.js';

// Add this debug code
console.log('🔍 Auth Controller imports:', {
  register: typeof register,
  login: typeof login,
  protect: typeof protect,
  updatePassword: typeof updatePassword
});

// Check if any are undefined
if (!register || !login || !protect || !updatePassword) {
  console.error('❌ Some auth functions are undefined!');
  process.exit(1);
}

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update-password', protect, updatePassword);

export default router;