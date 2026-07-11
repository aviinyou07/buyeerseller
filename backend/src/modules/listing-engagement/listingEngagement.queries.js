import pool from '../../db.js';

let schemaReady = false;

export async function ensureEngagementTables() {
  if (schemaReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS listing_likes (
      id BIGINT NOT NULL AUTO_INCREMENT,
      listing_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_listing_like (listing_id, user_id),
      KEY listing_likes_listing_id_idx (listing_id),
      KEY listing_likes_user_id_idx (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS listing_comments (
      id BIGINT NOT NULL AUTO_INCREMENT,
      listing_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      parent_comment_id BIGINT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY listing_comments_listing_id_idx (listing_id),
      KEY listing_comments_user_id_idx (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS listing_reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating TINYINT NOT NULL DEFAULT 5,
    review TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY listing_reviews_listing_id_idx (listing_id),
    KEY listing_reviews_user_id_idx (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS listing_views (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY listing_views_listing_id_idx (listing_id),
    KEY listing_views_user_id_idx (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS listing_interactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    interaction_type ENUM('call', 'chat') NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_interaction (listing_id, user_id, interaction_type),
    KEY listing_interactions_listing_id_idx (listing_id),
    KEY listing_interactions_user_id_idx (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

schemaReady = true;
}

export async function getLikeState(listingId, userId) {
  await ensureEngagementTables();

  const [[{ likesCount }]] = await pool.query(
    'SELECT COUNT(*) AS likesCount FROM listing_likes WHERE listing_id = ?',
    [listingId]
  );

  let isLiked = false;
  if (userId) {
    const [rows] = await pool.query(
      'SELECT id FROM listing_likes WHERE listing_id = ? AND user_id = ? LIMIT 1',
      [listingId, userId]
    );
    isLiked = rows.length > 0;
  }

  return { likesCount: Number(likesCount || 0), isLiked };
}

export async function toggleLike(listingId, userId) {
  await ensureEngagementTables();

  const [existing] = await pool.query(
    'SELECT id FROM listing_likes WHERE listing_id = ? AND user_id = ? LIMIT 1',
    [listingId, userId]
  );

  if (existing.length) {
    await pool.query('DELETE FROM listing_likes WHERE id = ?', [existing[0].id]);
  } else {
    await pool.query(
      'INSERT INTO listing_likes (listing_id, user_id) VALUES (?, ?)',
      [listingId, userId]
    );
  }

  return getLikeState(listingId, userId);
}

export async function listReviews(listingId) {
  await ensureEngagementTables();

  const [rows] = await pool.query(
    `SELECT lr.id, lr.listing_id, lr.user_id, lr.rating, lr.review, lr.created_at,
            COALESCE(NULLIF(TRIM(u.full_name), ''), NULLIF(TRIM(u.name), ''), 'User') AS user_name
     FROM listing_reviews lr
     LEFT JOIN users u ON u.id = lr.user_id
     WHERE lr.listing_id = ?
     ORDER BY lr.created_at DESC`,
    [listingId]
  );

  return rows;
}

export async function createReview({ listingId, userId, rating, review }) {
  await ensureEngagementTables();

  const [result] = await pool.query(
    'INSERT INTO listing_reviews (listing_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
    [listingId, userId, rating, review]
  );

  const [rows] = await pool.query(
    `SELECT lr.id, lr.listing_id, lr.user_id, lr.rating, lr.review, lr.created_at,
            COALESCE(NULLIF(TRIM(u.full_name), ''), NULLIF(TRIM(u.name), ''), 'User') AS user_name
     FROM listing_reviews lr
     LEFT JOIN users u ON u.id = lr.user_id
     WHERE lr.id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

export async function listComments(listingId) {
  await ensureEngagementTables();

  const [rows] = await pool.query(
    `SELECT lc.id, lc.listing_id, lc.user_id, lc.parent_comment_id, lc.comment, lc.created_at,
            COALESCE(NULLIF(TRIM(u.full_name), ''), NULLIF(TRIM(u.name), ''), 'User') AS user_name
     FROM listing_comments lc
     LEFT JOIN users u ON u.id = lc.user_id
     WHERE lc.listing_id = ?
     ORDER BY lc.created_at DESC`,
    [listingId]
  );

  return rows;
}

export async function createComment({ listingId, userId, comment }) {
  await ensureEngagementTables();

  const [result] = await pool.query(
    'INSERT INTO listing_comments (listing_id, user_id, comment) VALUES (?, ?, ?)',
    [listingId, userId, comment]
  );

  const [rows] = await pool.query(
    `SELECT lc.id, lc.listing_id, lc.user_id, lc.parent_comment_id, lc.comment, lc.created_at,
            COALESCE(NULLIF(TRIM(u.full_name), ''), NULLIF(TRIM(u.name), ''), 'User') AS user_name
     FROM listing_comments lc
     LEFT JOIN users u ON u.id = lc.user_id
     WHERE lc.id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

export async function recordListingView({ listingId, userId = null }) {
  await ensureEngagementTables();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM listings WHERE id = ? LIMIT 1 FOR UPDATE',
      [listingId]
    );

    if (!existing.length) {
      await connection.rollback();
      return { viewed: false, viewsCount: 0 };
    }

    if (userId) {
      const [existingView] = await connection.query(
        'SELECT id FROM listing_views WHERE listing_id = ? AND user_id = ? LIMIT 1',
        [listingId, userId]
      );
      if (existingView.length > 0) {
        // Already viewed by this user, return current count
        const [[row]] = await connection.query(
          `SELECT views_count AS viewsCount FROM listings WHERE id = ? LIMIT 1`,
          [listingId]
        );
        await connection.commit();
        return { viewed: false, viewsCount: Number(row?.viewsCount || 0) };
      }
    }

    await connection.query(
      `INSERT INTO listing_views (listing_id, user_id, viewed_at)
       VALUES (?, ?, NOW())`,
      [listingId, userId]
    );

    await connection.query(
      `UPDATE listings
       SET views_count = COALESCE(views_count, 0) + 1
       WHERE id = ?`,
      [listingId]
    );

    const [[row]] = await connection.query(
      `SELECT views_count AS viewsCount
       FROM listings
       WHERE id = ?
       LIMIT 1`,
      [listingId]
    );

    await connection.commit();

    return {
      viewed: true,
      viewsCount: Number(row?.viewsCount || 0),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function addListingInteraction(listingId, userId, interactionType) {
  await ensureEngagementTables();
  
  if (!['call', 'chat'].includes(interactionType)) {
    throw new Error('Invalid interaction type');
  }
  
  // Use INSERT IGNORE to silently handle duplicate interaction requests from the same user for the same listing
  const [result] = await pool.query(
    'INSERT IGNORE INTO listing_interactions (listing_id, user_id, interaction_type) VALUES (?, ?, ?)',
    [listingId, userId, interactionType]
  );
  
  return result;
}
