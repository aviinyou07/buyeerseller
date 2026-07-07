import { Router } from 'express';
import { getCategories, getCategoryForm } from './categories.controller.js';

const router = Router();

// GET /api/categories
router.get('/', getCategories);

// GET /api/categories/:slug/form
router.get('/:slug/form', getCategoryForm);

export default router;
