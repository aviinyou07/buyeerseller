const { pool } = require('../config/database');

class Form {
  static async findByCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT id, category_id, title FROM forms WHERE category_id = ? LIMIT 1',
      [categoryId]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, category_id, title FROM forms WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  static async findWithFields(id) {
    const [formRows] = await pool.query('SELECT * FROM forms WHERE id = ? LIMIT 1', [id]);
    if (formRows.length === 0) return null;
    const form = formRows[0];
    const [fields] = await pool.query('SELECT * FROM form_fields WHERE form_id = ?', [id]);
    form.fields = fields;
    return form;
  }

  static async createOrUpdate({ category_id, title, fields }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Find form if it exists
      const [formRows] = await connection.query(
        'SELECT id FROM forms WHERE category_id = ? LIMIT 1',
        [category_id]
      );

      let formId;
      let actionText;

      if (formRows.length > 0) {
        formId = formRows[0].id;
        actionText = 'Updated';

        await connection.query(
          'UPDATE forms SET title = ? WHERE id = ?',
          [title, formId]
        );

        // Delete existing form fields
        await connection.query(
          'DELETE FROM form_fields WHERE form_id = ?',
          [formId]
        );
      } else {
        actionText = 'Created';
        const [insertResult] = await connection.query(
          'INSERT INTO forms (category_id, title) VALUES (?, ?)',
          [category_id, title]
        );
        formId = insertResult.insertId;
      }

      // Insert new form fields
      for (const field of fields) {
        const key = field.field_key || field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        await connection.query(
          'INSERT INTO form_fields (form_id, label, field_key, field_type, options) VALUES (?, ?, ?, ?, ?)',
          [formId, field.label, key, field.field_type, field.options || null]
        );
      }

      const [createdFields] = await connection.query(
        'SELECT * FROM form_fields WHERE form_id = ?',
        [formId]
      );

      await connection.commit();
      return { formId, fields: createdFields, action: actionText };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete child fields
      await connection.query('DELETE FROM form_fields WHERE form_id = ?', [id]);
      // Delete parent form
      await connection.query('DELETE FROM forms WHERE id = ?', [id]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = Form;
