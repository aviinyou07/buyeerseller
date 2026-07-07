import { Router } from 'express';
import { sendOtp, verifyLogin, verifyRegister, getMe } from './auth.controller.js';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-login
router.post('/verify-login', verifyLogin);

// POST /api/auth/verify-register
router.post('/verify-register', verifyRegister);

// GET /api/auth/me  (JWT required in Authorization header)
router.get('/me', getMe);

export default router;
