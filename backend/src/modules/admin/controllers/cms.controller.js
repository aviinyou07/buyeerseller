const { CmsPage } = require('../models');
const { success, error } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

// Helper to slugify cms slugs
const slugifyCms = (text) => {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

/**
 * List all CMS Pages
 * GET /api/v1/admin/cms
 */
const listCmsPages = async (req, res) => {
  try {
    const pages = await CmsPage.findAll();
    return success(res, 'CMS pages list retrieved successfully', pages);
  } catch (err) {
    console.error('List CMS error:', err);
    return error(res, 'An error occurred fetching CMS pages list', 500);
  }
};

/**
 * Get CMS Page by Slug
 * GET /api/v1/admin/cms/:slug
 */
const getCmsPage = async (req, res) => {
  const { slug } = req.params;

  try {
    const page = await CmsPage.findBySlug(slug);

    if (!page) {
      return error(res, `CMS Page '${slug}' not found`, 404);
    }
    return success(res, 'CMS page content retrieved successfully', page);
  } catch (err) {
    console.error('Get CMS Page error:', err);
    return error(res, 'An error occurred fetching CMS page details', 500);
  }
};

/**
 * Create or Update CMS Page
 * POST /api/v1/admin/cms
 * Body: { title, slug, content }
 */
const createOrUpdateCmsPage = async (req, res) => {
  const { title, slug, content } = req.body;

  if (!title || !content) {
    return error(res, 'Please provide title and content', 400);
  }

  const pageSlug = slug ? slugifyCms(slug) : slugifyCms(title);

  try {
    const existingPage = await CmsPage.findBySlug(pageSlug);

    let pageId;
    let actionText = '';

    if (existingPage) {
      pageId = existingPage.id;
      actionText = 'Updated';
      await CmsPage.update(pageId, { title, content });
    } else {
      actionText = 'Created';
      pageId = await CmsPage.create({ title, slug: pageSlug, content });
    }

    await logAdminAction(req.user.id, `${actionText} CMS Page: '${title}'`, 'CmsPage', pageId);

    const updatedPage = await CmsPage.findById(pageId);

    return success(res, `CMS page successfully ${actionText.toLowerCase()}`, updatedPage);
  } catch (err) {
    console.error('Create/Update CMS error:', err);
    return error(res, 'An error occurred managing CMS page content', 500);
  }
};

/**
 * Delete CMS Page
 * DELETE /api/v1/admin/cms/:id
 */
const deleteCmsPage = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await CmsPage.findById(id);

    if (!page) {
      return error(res, 'CMS page not found', 404);
    }

    const title = page.title;
    await CmsPage.delete(id);

    await logAdminAction(req.user.id, `Deleted CMS Page: '${title}'`, 'CmsPage', id);

    return success(res, 'CMS page deleted successfully');
  } catch (err) {
    console.error('Delete CMS error:', err);
    return error(res, 'An error occurred deleting CMS page', 500);
  }
};

module.exports = {
  listCmsPages,
  getCmsPage,
  createOrUpdateCmsPage,
  deleteCmsPage
};
