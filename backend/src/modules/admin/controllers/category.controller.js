const { Category } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');
const { createCategoryImageVariants } = require('../utils/categoryImages');

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Get category hierarchical tree structure
 * GET /api/v1/admin/categories/tree
 */
const getCategoryTree = async (req, res) => {
  try {
    const allCategories = await Category.findAll();

    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, subcategories: [] };
    });

    const tree = [];
    allCategories.forEach(cat => {
      const mapped = categoryMap[cat.id];
      if (cat.parent_id) {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].subcategories.push(mapped);
        } else {
          tree.push(mapped);
        }
      } else {
        tree.push(mapped);
      }
    });

    return success(res, 'Category tree retrieved successfully', tree);
  } catch (err) {
    console.error('Get Category Tree error:', err);
    return error(res, 'An error occurred building category tree', 500);
  }
};

/**
 * List Categories (flat list with search & pagination)
 * GET /api/v1/admin/categories
 */
const listCategories = async (req, res) => {
  const { search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await Category.count({ search });

    // 2. Fetch paginated records
    const categories = await Category.findPaginated({
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    // 3. Fetch subcategories counts
    const subcounts = await Category.getSubcategoryCounts();

    const subcountMap = {};
    subcounts.forEach(row => {
      subcountMap[row.parent_id] = row.count;
    });

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      parentCategory: cat.parent_id ? { id: cat.parent_id, name: cat.parent_name } : null,
      form: cat.form_id ? { id: cat.form_id, title: cat.form_title } : null,
      subcategories_count: subcountMap[cat.id] || 0
    }));

    return paginate(res, 'Categories listed successfully', categoriesWithCount, page, limit, totalItems);
  } catch (err) {
    console.error('List Categories error:', err);
    return error(res, 'An error occurred fetching categories', 500);
  }
};

/**
 * Create Category
 * POST /api/v1/admin/categories
 */
const createCategory = async (req, res) => {
  const { name, parent_id, accent, image, description } = req.body;

  if (!name) {
    return error(res, 'Category name is required', 400);
  }

  try {
    const slug = slugify(name);
    
    // Check if slug is unique
    const existing = await Category.findBySlug(slug);

    if (existing) {
      return error(res, `A category with equivalent name '${name}' already exists`, 400);
    }

    if (parent_id) {
      const parent = await Category.findById(parent_id);
      if (!parent) {
        return error(res, 'Specified parent category does not exist', 404);
      }
    }

    let imagePath = image || '';
    let imageThumbnail = image || '';
    if (req.file && parent_id) {
      const variants = await createCategoryImageVariants(req.file);
      imagePath = variants.originalUrl;
      imageThumbnail = variants.thumbnailUrl;
    }

    const newCategoryId = await Category.create({
      parent_id: parent_id || null,
      name,
      slug,
      accent,
      image: imagePath,
      image_thumbnail: imageThumbnail,
      description: description || null
    });

    await logAdminAction(req.user.id, `Created Category: ${name}`, 'Category', newCategoryId);

    const newCategory = await Category.findById(newCategoryId);

    return success(res, 'Category created successfully', newCategory, 201);
  } catch (err) {
    console.error('Create Category error:', err);
    return error(res, 'An error occurred creating category', 500);
  }
};

/**
 * Update Category
 * PUT /api/v1/admin/categories/:id
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parent_id, is_active, accent, image, description } = req.body;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return error(res, 'Category not found', 404);
    }

    if (parent_id && parseInt(parent_id, 10) === parseInt(id, 10)) {
      return error(res, 'A category cannot be its own parent category', 400);
    }

    let updatedName = category.name;
    let updatedSlug = category.slug;
    let updatedParentId = category.parent_id;
    let updatedIsActive = category.is_active;

    if (name) {
      updatedName = name;
      updatedSlug = slugify(name);
    }

    if (parent_id !== undefined) {
      if (parent_id) {
        const parent = await Category.findById(parent_id);
        if (!parent) {
          return error(res, 'Specified parent category does not exist', 404);
        }
        updatedParentId = parent_id;
      } else {
        updatedParentId = null;
      }
    }

    if (is_active !== undefined) {
      updatedIsActive = is_active ? 1 : 0;
    }

    let imagePath = image;
    let imageThumbnail;
    if (req.file && updatedParentId) {
      const variants = await createCategoryImageVariants(req.file);
      imagePath = variants.originalUrl;
      imageThumbnail = variants.thumbnailUrl;
    }

    await Category.update(id, {
      name: updatedName,
      slug: updatedSlug,
      parent_id: updatedParentId,
      is_active: updatedIsActive,
      accent: accent !== undefined ? accent : category.accent,
      image: imagePath !== undefined ? imagePath : category.image,
      image_thumbnail: imageThumbnail !== undefined ? imageThumbnail : category.image_thumbnail,
      description: description !== undefined ? description || null : category.description
    });

    await logAdminAction(req.user.id, `Updated Category: ${updatedName}`, 'Category', id);

    const updatedCategory = await Category.findById(id);

    return success(res, 'Category updated successfully', updatedCategory);
  } catch (err) {
    console.error('Update Category error:', err);
    return error(res, 'An error occurred updating category', 500);
  }
};

/**
 * Delete Category
 * DELETE /api/v1/admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return error(res, 'Category not found', 404);
    }

    await Category.delete(id);

    await logAdminAction(req.user.id, `Deleted Category: ${category.name}`, 'Category', id);

    return success(res, 'Category deleted successfully');
  } catch (err) {
    console.error('Delete Category error:', err);
    return error(res, 'An error occurred deleting category', 500);
  }
};

/**
 * Toggle Active Status of Category
 * PATCH /api/v1/admin/categories/:id/toggle
 */
const toggleCategoryStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return error(res, 'Category not found', 404);
    }

    const nextActive = category.is_active ? 0 : 1;

    await Category.toggleStatus(id, nextActive);

    const actionText = nextActive ? 'Activated' : 'Deactivated';
    await logAdminAction(req.user.id, `${actionText} Category: ${category.name}`, 'Category', id);

    const updatedCategory = await Category.findById(id);

    return success(res, `Category status changed to ${nextActive ? 'active' : 'inactive'}`, updatedCategory);
  } catch (err) {
    console.error('Toggle Category error:', err);
    return error(res, 'An error occurred toggling category status', 500);
  }
};

module.exports = {
  getCategoryTree,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
};
