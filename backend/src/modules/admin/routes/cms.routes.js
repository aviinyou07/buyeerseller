const express = require('express');
const router = express.Router();
const { 
  listCmsPages, 
  getCmsPage, 
  createOrUpdateCmsPage, 
  deleteCmsPage 
} = require('../controllers/cms.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listCmsPages);
router.get('/:slug', getCmsPage);
router.post('/', createOrUpdateCmsPage);
router.delete('/:id', deleteCmsPage);

module.exports = router;
