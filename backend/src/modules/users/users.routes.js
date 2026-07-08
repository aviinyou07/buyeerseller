import { Router } from 'express';
import { getProfileData, updateProfileData } from './users.controller.js';

const router = Router();

// GET /api/users/profile-data
router.get('/profile-data', getProfileData);

// PATCH /api/users/profile-data
router.patch('/profile-data', updateProfileData);

export default router;
