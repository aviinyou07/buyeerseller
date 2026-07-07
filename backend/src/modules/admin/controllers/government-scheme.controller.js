const { GovernmentScheme, Category } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * List all government schemes
 * GET /api/v1/admin/government-schemes
 * Query: category_id, type (current|upcoming), search, limit, page
 */
const listSchemes = async (req, res) => {
  const { category_id, type, search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await GovernmentScheme.count({
      category_id: category_id ? parseInt(category_id, 10) : null,
      type,
      search
    });

    // 2. Fetch paginated schemes
    const schemes = await GovernmentScheme.findPaginated({
      category_id: category_id ? parseInt(category_id, 10) : null,
      type,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedSchemes = schemes.map(gs => ({
      id: gs.id,
      category_id: gs.category_id,
      title: gs.title,
      description: gs.description,
      eligibility: gs.eligibility,
      scheme_type: gs.scheme_type,
      start_date: gs.start_date,
      end_date: gs.end_date,
      category: { id: gs.category_id, name: gs.category_name }
    }));

    return paginate(res, 'Government schemes retrieved successfully', processedSchemes, page, limit, totalItems);
  } catch (err) {
    console.error('List Schemes error:', err);
    return error(res, 'An error occurred fetching schemes', 500);
  }
};

/**
 * Get government schemes grouped category-wise
 * GET /api/v1/admin/government-schemes/category-wise
 */
const getSchemesCategoryWise = async (req, res) => {
  try {
    // 1. Fetch all active categories
    const allCategories = await Category.findAll();
    const categories = allCategories.filter(cat => cat.is_active === 1 || cat.is_active === true);

    // 2. For each, load schemes
    const categorySchemes = await Promise.all(categories.map(async (cat) => {
      const schemes = await GovernmentScheme.findByCategory(cat.id);

      return {
        id: cat.id,
        name: cat.name,
        schemes
      };
    }));

    // Filter categories that have at least one scheme
    const filteredCategories = categorySchemes.filter(cat => cat.schemes.length > 0);

    return success(res, 'Schemes category-wise retrieved successfully', filteredCategories);
  } catch (err) {
    console.error('Get Category-wise Schemes error:', err);
    return error(res, 'An error occurred grouping schemes by category', 500);
  }
};

/**
 * Create Government Scheme
 * POST /api/v1/admin/government-schemes
 */
const createScheme = async (req, res) => {
  const { category_id, title, description, eligibility, scheme_type, start_date, end_date } = req.body;

  if (!title || !category_id || !scheme_type) {
    return error(res, 'Please provide title, category_id, and scheme_type (current/upcoming)', 400);
  }

  try {
    const category = await Category.findById(category_id);

    if (!category) {
      return error(res, 'Specified category does not exist', 404);
    }

    const newSchemeId = await GovernmentScheme.create({
      category_id,
      title,
      description,
      eligibility,
      scheme_type,
      start_date,
      end_date
    });

    await logAdminAction(req.user.id, `Created Government Scheme: '${title}'`, 'GovernmentScheme', newSchemeId);

    const newScheme = await GovernmentScheme.findById(newSchemeId);

    return success(res, 'Government scheme created successfully', newScheme, 201);
  } catch (err) {
    console.error('Create Scheme error:', err);
    return error(res, 'An error occurred creating government scheme', 500);
  }
};

/**
 * Update Government Scheme
 * PUT /api/v1/admin/government-schemes/:id
 */
const updateScheme = async (req, res) => {
  const { id } = req.params;
  const { category_id, title, description, eligibility, scheme_type, start_date, end_date } = req.body;

  try {
    const scheme = await GovernmentScheme.findById(id);

    if (!scheme) {
      return error(res, 'Government scheme not found', 404);
    }

    let updatedCatId = scheme.category_id;
    let updatedTitle = scheme.title;
    let updatedDesc = scheme.description;
    let updatedEligibility = scheme.eligibility;
    let updatedType = scheme.scheme_type;
    let updatedStart = scheme.start_date;
    let updatedEnd = scheme.end_date;

    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return error(res, 'Specified category does not exist', 404);
      }
      updatedCatId = category_id;
    }

    if (title) updatedTitle = title;
    if (description !== undefined) updatedDesc = description;
    if (eligibility !== undefined) updatedEligibility = eligibility;
    if (scheme_type) updatedType = scheme_type;
    if (start_date !== undefined) updatedStart = start_date;
    if (end_date !== undefined) updatedEnd = end_date;

    await GovernmentScheme.update(id, {
      category_id: updatedCatId,
      title: updatedTitle,
      description: updatedDesc,
      eligibility: updatedEligibility,
      scheme_type: updatedType,
      start_date: updatedStart,
      end_date: updatedEnd
    });

    await logAdminAction(req.user.id, `Updated Government Scheme: '${updatedTitle}'`, 'GovernmentScheme', id);

    const updatedScheme = await GovernmentScheme.findById(id);

    return success(res, 'Government scheme updated successfully', updatedScheme);
  } catch (err) {
    console.error('Update Scheme error:', err);
    return error(res, 'An error occurred updating government scheme', 500);
  }
};

/**
 * Delete Government Scheme
 * DELETE /api/v1/admin/government-schemes/:id
 */
const deleteScheme = async (req, res) => {
  const { id } = req.params;

  try {
    const scheme = await GovernmentScheme.findById(id);

    if (!scheme) {
      return error(res, 'Government scheme not found', 404);
    }

    await GovernmentScheme.delete(id);

    await logAdminAction(req.user.id, `Deleted Government Scheme: '${scheme.title}'`, 'GovernmentScheme', id);

    return success(res, 'Government scheme deleted successfully');
  } catch (err) {
    console.error('Delete Scheme error:', err);
    return error(res, 'An error occurred deleting government scheme', 500);
  }
};

module.exports = {
  listSchemes,
  getSchemesCategoryWise,
  createScheme,
  updateScheme,
  deleteScheme
};
