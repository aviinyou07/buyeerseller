import { Router } from 'express';
import { getSchemes } from './schemes.controller.js';

const router = Router();

router.get('/', getSchemes);

export default router;
