import { Router } from 'express';
import { getProfileData } from './users.controller.js';

const router = Router();

// GET /api/users/profile-data
router.get('/profile-data', getProfileData);

export default router;
