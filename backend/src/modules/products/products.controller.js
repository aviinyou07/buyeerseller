import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  listlistings,
  getProductById,
  createProduct,
  updateProduct,
  getSubcategoryBySlug,
} from './products.queries.js';
import { createProductImageVariants } from '../../utils/productImages.js';
import { recordListingView } from '../listing-engagement/listingEngagement.queries.js';

// ─── Multer (disk storage) ──────────────────────────────────────────────────
// Store uploads in `uploads/listings/` and expose relative URLs like `/uploads/listings/<file>`
const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const dir = path.join(process.cwd(), 'uploads', 'listings');
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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMiddleware = upload.array('photos', 10);

// ─── Auth helper ─────────────────────────────────────────────────────────────
function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return { error: 'No Bearer token' };
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch (err) {
    return { error: err.message };
  }
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/listings
 * Query params: subcategoryId, categoryId, sellerId, search, location, status, page, limit
 */
export async function getlistings(req, res) {
  try {
    const { subcategoryId, categoryId, sellerId, search, location, status, page, limit } = req.query;
    const user = getUserFromToken(req);
    const result = await listlistings({
      subcategoryId,
      categoryId,
      sellerId: sellerId ? Number(sellerId) : undefined,
      search,
      location,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 30,
      userId: user?.id,
    });
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('[listings.getlistings]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * GET /api/listings/:id
 */
export async function getProduct(req, res) {
  try {
    const user = getUserFromToken(req);
    const productId = Number(req.params.id);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Valid product id is required.',
      });
    }

    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await recordListingView({
      listingId: productId,
      userId: user?.id || null,
    });

    const updatedProduct = await getProductById(productId);

    return res.json({
      success: true,
      product: updatedProduct || product,
    });
  } catch (error) {
    console.error('[listings.getProduct]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

/**
 * POST /api/listings
 * Body: multipart/form-data
 * Fields: title, price, brand, description, location, subcategory_slug, condition, warranty, usedFor, offer_badge
 * Files: photos[]
 * Auth: Bearer token required
 */
export async function postProduct(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No Bearer token found.' });
    }
    let user;
    try {
      user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: `Invalid or expired token: ${err.message}` });
    }
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required.' });

    const { title, price, brand, description, location, subcategory_slug, condition, warranty, usedFor, offer_badge, custom_fields } = req.body;

    if (!title || !price || !subcategory_slug) {
      return res.status(400).json({ success: false, message: 'title, price and subcategory_slug are required.' });
    }

    // Resolve subcategory slug → id
    const sub = await getSubcategoryBySlug(subcategory_slug);
    if (!sub) return res.status(400).json({ success: false, message: `Unknown subcategory: ${subcategory_slug}` });

    const photoUrls = await createProductImageVariants(req.files || []);

    let meta = null;
    try {
      if (custom_fields) {
        meta = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      }
    } catch (err) {
      meta = null;
    }

    const productMeta = {
      ...(meta || {}),
      imageThumbnails: photoUrls.map((photo) => photo.thumbnailUrl || photo.originalUrl || photo),
    };

    const productId = await createProduct({
      sellerId: user.id,
      categoryId: sub.category_id,
      subcategoryId: sub.id,
      title: title.trim(),
      brand: brand?.trim() || null,
      description: description?.trim() || null,
      price: Number(price),
      location: location?.trim() || null,
      condition: condition || null,
      warranty: warranty || null,
      usedFor: usedFor || null,
      offerBadge: offer_badge || null,
      meta: productMeta,
    }, photoUrls);

    return res.status(201).json({ success: true, message: 'Listing created and pending review.', productId });
  } catch (error) {
    console.error('[listings.postProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * PUT /api/listings/:id
 * Body: multipart/form-data
 * Auth: Bearer token required
 */
export async function putProduct(req, res) {
  try {
    const auth = req.headers.authorization;
    const user = getUserFromToken(req);
    if (user?.error) return res.status(401).json({ success: false, message: `Auth Failed: ${user.error}` });
    if (!user) return res.status(401).json({ success: false, message: `Authentication required.` });

    const { title, price, brand, description, location, subcategory_slug, condition, warranty, usedFor, offer_badge, custom_fields } = req.body;

    if (!title || !price || !subcategory_slug) {
      return res.status(400).json({ success: false, message: 'title, price and subcategory_slug are required.' });
    }

    const sub = await getSubcategoryBySlug(subcategory_slug);
    if (!sub) return res.status(400).json({ success: false, message: `Unknown subcategory: ${subcategory_slug}` });

    const photoUrls = await createProductImageVariants(req.files || []);

    let meta = null;
    try {
      if (custom_fields) {
        meta = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      }
    } catch {
      meta = null;
    }

    const productMeta = {
      ...(meta || {}),
      ...(photoUrls.length
        ? { imageThumbnails: photoUrls.map((photo) => photo.thumbnailUrl || photo.originalUrl || photo) }
        : {}),
    };

    const result = await updateProduct(req.params.id, {
      sellerId: user.id,
      categoryId: sub.category_id,
      subcategoryId: sub.id,
      title: title.trim(),
      brand: brand?.trim() || null,
      description: description?.trim() || null,
      price: Number(price),
      location: location?.trim() || null,
      condition: condition || null,
      warranty: warranty || null,
      usedFor: usedFor || null,
      offerBadge: offer_badge || null,
      meta: productMeta,
    }, photoUrls);

    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (result.status === 'forbidden') {
      return res.status(403).json({ success: false, message: 'You can only edit your own listings.' });
    }

    return res.json({ success: true, message: 'Listing updated successfully.' });
  } catch (error) {
    console.error('[listings.putProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
