const { Category, Form, FormField } = require('../models');
const { success, error } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * Get Dynamic Form by Category ID
 * GET /api/v1/admin/dynamic-forms/category/:categoryId
 */
const getFormByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return error(res, 'Category not found', 404);
    }

    const form = await Form.findByCategory(categoryId);

    if (!form) {
      return success(res, 'No dynamic form set up for this category', null);
    }

    const fields = await FormField.findByForm(form.id);

    form.fields = fields;

    return success(res, 'Dynamic form retrieved successfully', form);
  } catch (err) {
    console.error('Get Form by Category error:', err);
    return error(res, 'An error occurred fetching form configuration', 500);
  }
};

/**
 * Create or Update Form for a Category
 * POST /api/v1/admin/dynamic-forms
 * Body payload: { category_id, title, fields: [{ label, field_key, field_type }] }
 */
const createOrUpdateForm = async (req, res) => {
  const { category_id, title, fields } = req.body;

  if (!category_id || !title || !Array.isArray(fields)) {
    return error(res, 'Please provide category_id, form title, and fields array', 400);
  }

  try {
    const category = await Category.findById(category_id);

    if (!category) {
      return error(res, 'Specified category does not exist', 404);
    }

    const result = await Form.createOrUpdate({
      category_id,
      title,
      fields
    });

    await logAdminAction(
      req.user.id, 
      `${result.action} Form for Category: ${category.name}`, 
      'Form', 
      result.formId
    );

    return success(res, `Form ${result.action.toLowerCase()} successfully`, {
      form_id: result.formId,
      category_id,
      title,
      fields: result.fields
    });
  } catch (err) {
    console.error('Create/Update Form error:', err);
    return error(res, 'An error occurred building form fields', 500);
  }
};

/**
 * Delete dynamic form configuration
 * DELETE /api/v1/admin/dynamic-forms/:id
 */
const deleteForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);

    if (!form) {
      return error(res, 'Form not found', 404);
    }

    const category = await Category.findById(form.category_id);
    const categoryName = category ? category.name : 'Unknown';

    await Form.delete(id);

    await logAdminAction(req.user.id, `Deleted Form for Category: ${categoryName}`, 'Form', id);

    return success(res, 'Dynamic form configuration deleted successfully');
  } catch (err) {
    console.error('Delete Form error:', err);
    return error(res, 'An error occurred deleting form configuration', 500);
  }
};

module.exports = {
  getFormByCategory,
  createOrUpdateForm,
  deleteForm
};
