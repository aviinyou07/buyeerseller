import { Router } from 'express';
import { sendOtp, login, verifyRegister, getMe, resetPassword } from './auth.controller.js';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/verify-register
router.post('/verify-register', verifyRegister);

// GET /api/auth/me  (JWT required in Authorization header)
router.get('/me', getMe);

export default router;
