const express = require('express');
const router = express.Router();
const { listBanners, createBanner, deleteBanner } = require('../controllers/banner.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listBanners);
router.post('/', upload.single('image'), createBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
