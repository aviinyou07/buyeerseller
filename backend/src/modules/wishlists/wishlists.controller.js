import jwt from 'jsonwebtoken';
import { getWishlistByUser, addToWishlist, removeFromWishlist } from './wishlists.queries.js';

function requireAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return null;
  }
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch (err) {
    console.error('[requireAuth] verification failed:', err.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: err.message });
    return null;
  }
}

/**
 * GET /api/wishlists
 */
export async function getWishlist(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const wishlist = await getWishlistByUser(user.id);
    return res.json({ success: true, wishlist });
  } catch (error) {
    console.error('[wishlists.getWishlist]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * POST /api/wishlists
 * Body: { product_id }
 */
export async function addWishlist(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: 'product_id is required.' });
  try {
    await addToWishlist(user.id, product_id);
    return res.json({ success: true, message: 'Added to wishlist.' });
  } catch (error) {
    console.error('[wishlists.addWishlist]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * DELETE /api/wishlists/:productId
 */
export async function deleteWishlist(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    await removeFromWishlist(user.id, req.params.productId);
    return res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    console.error('[wishlists.deleteWishlist]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
