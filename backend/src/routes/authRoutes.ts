import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.put('/profile', authenticate, updateProfile);

export default router;
