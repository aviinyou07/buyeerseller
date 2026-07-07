const express = require('express');
const router = express.Router();
const { 
  listSchemes, 
  getSchemesCategoryWise, 
  createScheme, 
  updateScheme, 
  deleteScheme 
} = require('../controllers/government-scheme.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listSchemes);
router.get('/category-wise', getSchemesCategoryWise);
router.post('/', createScheme);
router.put('/:id', updateScheme);
router.delete('/:id', deleteScheme);

module.exports = router;
