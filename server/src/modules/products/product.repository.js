const db = require('../../config/database');

const PRODUCT_FIELDS = `
  id, company_id, name, sku, description, category_id, base_price, is_active,
  created_at, updated_at
`;

const createProduct = async (data) => {
  const { company_id, name, sku, description, category_id, base_price, is_active } = data;

  const query = `
    INSERT INTO products (
      company_id, name, sku, description, category_id, base_price, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING ${PRODUCT_FIELDS}
  `;
  const values = [
    company_id,
    name,
    sku || null,
    description || null,
    category_id || null,
    base_price || 0,
    is_active !== undefined ? is_active : true
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getProducts = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.category_id) {
    conditions.push(`category_id = $${i}`);
    values.push(filters.category_id);
    i++;
  }
  
  if (filters.is_active !== undefined) {
    conditions.push(`is_active = $${i}`);
    values.push(filters.is_active);
    i++;
  }

  const query = `SELECT ${PRODUCT_FIELDS} FROM products WHERE ${conditions.join(' AND ')} ORDER BY name ASC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getProductByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${PRODUCT_FIELDS} FROM products WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updateProduct = async (id, company_id, data) => {
  const allowedFields = ['name', 'sku', 'description', 'category_id', 'base_price', 'is_active'];
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(data[key]);
      i++;
    }
  }

  if (fields.length === 0) return getProductByIdAndCompany(id, company_id);

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${PRODUCT_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createProduct,
  getProducts,
  getProductByIdAndCompany,
  updateProduct,
  deleteProduct
};
