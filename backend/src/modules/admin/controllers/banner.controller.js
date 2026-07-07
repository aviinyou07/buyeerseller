const { Banner } = require('../models');
const { success, error } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');
const path = require('path');
const fs = require('fs');

/**
 * List all homepage banners
 * GET /api/v1/admin/banners
 */
const listBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();
    return success(res, 'Banners list retrieved successfully', banners);
  } catch (err) {
    console.error('List Banners error:', err);
    return error(res, 'An error occurred fetching banners list', 500);
  }
};

/**
 * Create Banner (supports file upload via multer)
 * POST /api/v1/admin/banners
 */
const createBanner = async (req, res) => {
  const { title } = req.body;

  let imageUrl = '';
  
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.image_url) {
    imageUrl = req.body.image_url;
  }

  if (!title || !imageUrl) {
    return error(res, 'Please provide banner title and upload an image file or provide image_url', 400);
  }

  try {
    const newBannerId = await Banner.create({ title, imageUrl });

    await logAdminAction(req.user.id, `Uploaded banner: '${title}'`, 'Banner', newBannerId);

    const newBanner = await Banner.findById(newBannerId);

    return success(res, 'Banner created successfully', newBanner, 201);
  } catch (err) {
    console.error('Create Banner error:', err);
    return error(res, 'An error occurred creating banner', 500);
  }
};

/**
 * Delete Banner
 * DELETE /api/v1/admin/banners/:id
 */
const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findById(id);

    if (!banner) {
      return error(res, 'Banner not found', 404);
    }

    const title = banner.title;
    const imageUrl = banner.image_url;

    // Delete local file if it resides in the uploads directory
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Banner.delete(id);

    await logAdminAction(req.user.id, `Deleted banner: '${title}'`, 'Banner', id);

    return success(res, 'Banner deleted successfully');
  } catch (err) {
    console.error('Delete Banner error:', err);
    return error(res, 'An error occurred deleting banner', 500);
  }
};

module.exports = {
  listBanners,
  createBanner,
  deleteBanner
};
