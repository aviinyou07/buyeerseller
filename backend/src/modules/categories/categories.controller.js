import { getAllCategories, getFormBySlug } from './categories.queries.js';

/**
 * GET /api/categories
 * Returns all categories with nested subcategory items.
 */
export async function getCategories(req, res) {
  try {
    const data = await getAllCategories();
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[categories.getCategories]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * GET /api/categories/:slug/form
 * Returns form configuration for a subcategory/category slug.
 */
export async function getCategoryForm(req, res) {
  try {
    const { slug } = req.params;
    const data = await getFormBySlug(slug);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[categories.getCategoryForm]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
