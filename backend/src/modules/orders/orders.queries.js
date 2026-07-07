import pool from '../../db.js';

/**
 * Get orders where user is the buyer.
 * @param {number} userId
 */
export async function getOrdersByBuyer(userId) {
  const [rows] = await pool.query(
    `SELECT o.*, p.title AS title, p.title AS product_title, p.price AS product_price,
            (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1) AS product_image
     FROM orders o
     LEFT JOIN listings p ON p.id = o.product_id
     WHERE o.buyer_id = ?
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Get orders where user is the seller (sales).
 * @param {number} userId
 */
export async function getSalesBySeller(userId) {
  const [rows] = await pool.query(
    `SELECT o.*, p.title AS title, p.title AS product_title, p.price AS product_price,
            u.name AS buyer_name,
            (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1) AS product_image
     FROM orders o
     LEFT JOIN listings p ON p.id = o.product_id
     LEFT JOIN users u    ON u.id  = o.buyer_id
     WHERE o.seller_id = ?
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
}
