const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  getCategoryTree, 
  listCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategoryStatus 
} = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Set up local storage for uploaded category/subcategory images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const dir = path.join(process.cwd(), 'uploads', 'categories');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.use(protect);
router.use(adminOnly);

router.get('/tree', getCategoryTree);
router.get('/', listCategories);
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/:id/toggle', toggleCategoryStatus);


module.exports = router;
