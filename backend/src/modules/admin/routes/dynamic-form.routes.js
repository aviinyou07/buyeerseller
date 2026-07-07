const express = require('express');
const router = express.Router();
const { getFormByCategory, createOrUpdateForm, deleteForm } = require('../controllers/dynamic-form.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/category/:categoryId', getFormByCategory);
router.post('/', createOrUpdateForm);
router.delete('/:id', deleteForm);

module.exports = router;
