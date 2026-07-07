const { pool } = require('../config/database');

class ListingAttribute {
  static async findByListing(listingId) {
    const [rows] = await pool.query(
      `SELECT la.id AS attribute_id, la.value, ff.id AS field_id, ff.label, ff.field_key, ff.field_type
       FROM listing_attributes la
       LEFT JOIN form_fields ff ON la.form_field_id = ff.id
       WHERE la.listing_id = ?`,
      [listingId]
    );
    return rows;
  }
}

module.exports = ListingAttribute;
