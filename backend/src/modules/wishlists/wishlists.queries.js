import pool from '../../db.js';

/**
 * Get all wishlist items for a user with product details.
 * @param {number} userId
 */
export async function getWishlistByUser(userId) {
  const [rows] = await pool.query(
    `SELECT w.product_id, p.title, p.price, p.location,
            cat.title AS category_name,
            (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1) AS image
     FROM wishlists w
     JOIN listings p ON p.id = w.product_id
     LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
     LEFT JOIN categories cat    ON cat.id = sub.category_id
     WHERE w.user_id = ?
     ORDER BY w.id DESC`,
    [userId]
  );
  return rows;
}

/**
 * Add a product to wishlist (ignore if already exists).
 * @param {number} userId
 * @param {number} productId
 */
export async function addToWishlist(userId, productId) {
  await pool.query(
    'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );
}

/**
 * Remove a product from wishlist.
 * @param {number} userId
 * @param {number} productId
 */
export async function removeFromWishlist(userId, productId) {
  await pool.query(
    'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
}
