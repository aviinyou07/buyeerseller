import pool from '../../db.js';

let subcategoryColumnsCache = null;

async function getSubcategoryColumns() {
  if (!subcategoryColumnsCache) {
    const [cols] = await pool.query('SHOW COLUMNS FROM subcategories');
    subcategoryColumnsCache = new Set(cols.map((col) => col.Field));
  }
  return subcategoryColumnsCache;
}

// ─── Categories with subcategories ───────────────────────────────────────────

/**
 * Get all categories with their subcategories nested as `items`.
 */
export async function getAllCategories() {
  const subcategoryColumns = await getSubcategoryColumns();
  const imageSelect = subcategoryColumns.has('image_thumbnail')
    ? 's.image, s.image_thumbnail'
    : 's.image, s.image AS image_thumbnail';

  const [cats] = await pool.query(
    `SELECT c.id, c.slug, c.title, c.title_key AS titleKey, c.description, c.description_key AS descriptionKey, c.accent 
     FROM categories c
     INNER JOIN admin_categories ac ON ac.id = c.id
     WHERE ac.is_active = 1
     ORDER BY c.id`
  );
  const [subs] = await pool.query(
    `SELECT s.id, s.category_id, s.slug, s.name, ${imageSelect} 
     FROM subcategories s
     INNER JOIN admin_categories ac ON ac.id = s.id
     WHERE ac.is_active = 1
     ORDER BY s.id`
  );

  return cats.map((cat) => ({
    ...cat,
    items: subs.filter((s) => s.category_id === cat.id).map((s) => ({
      id: s.slug,
      name: s.name,
      image: s.image,
      imageThumbnail: s.image_thumbnail || s.image,
    })),
  }));
}

/**
 * Get dynamic form configuration by subcategory/category slug.
 * Includes parent fallback for subcategories.
 */
export async function getFormBySlug(slug) {
  // Find category in admin_categories
  const [cats] = await pool.query(
    'SELECT id, parent_id FROM admin_categories WHERE slug = ? LIMIT 1',
    [slug]
  );
  if (cats.length === 0) return null;
  const categoryId = cats[0].id;
  const parentId = cats[0].parent_id;

  // Find form for this category
  let [forms] = await pool.query(
    'SELECT id, title FROM forms WHERE category_id = ? LIMIT 1',
    [categoryId]
  );

  // If not found and there is a parent category, fall back to the parent category's form
  if (forms.length === 0 && parentId) {
    [forms] = await pool.query(
      'SELECT id, title FROM forms WHERE category_id = ? LIMIT 1',
      [parentId]
    );
  }

  if (forms.length === 0) return null;

  const form = forms[0];
  const [fields] = await pool.query(
    'SELECT id, label, field_key, field_type, options FROM form_fields WHERE form_id = ? ORDER BY id ASC',
    [form.id]
  );

  // Map field type to values that frontend expects ('select', 'number', 'text', 'textarea')
  const mapFieldType = (type) => {
    const t = String(type).toLowerCase();
    if (t === 'dropdown' || t === 'select') return 'select';
    return t;
  };

  return {
    id: form.id,
    title: form.title,
    fields: fields.map(f => {
      let opts = [];
      if (f.options) {
        opts = f.options.split(',').map(o => o.trim()).filter(Boolean);
      }
      return {
        name: f.field_key,
        label: f.label,
        type: mapFieldType(f.field_type),
        options: opts,
        placeholder: `Enter ${f.label.toLowerCase()}`
      };
    })
  };
}
