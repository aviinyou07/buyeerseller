import pool from '../../db.js';

/**
 * Fetch all government schemes from the database, joining with their category name.
 */
export async function getAllSchemes() {
  const [rows] = await pool.query(`
    SELECT gs.*, c.name AS category_name
    FROM government_schemes gs
    LEFT JOIN admin_categories c ON gs.category_id = c.id
    ORDER BY gs.id DESC
  `);
  return rows;
}
