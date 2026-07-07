const { pool } = require('../config/database');

class FormField {
  static async findByForm(formId) {
    const [rows] = await pool.query('SELECT * FROM form_fields WHERE form_id = ?', [formId]);
    return rows;
  }
}

module.exports = FormField;
