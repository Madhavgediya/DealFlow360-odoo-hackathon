const db = require('../../config/database');
const { resolveValidCompanyId, uuidRegex } = require('../../utils/companyResolver');

const PRODUCT_FIELDS = `
  id, company_id, name, sku, description, category_id, base_price, cost_price,
  type, preferred_vendor_id, service_provider, service_sla, stock, unit, image_url,
  is_active, created_at, updated_at
`;

const createProduct = async (data) => {
  const {
    company_id,
    name,
    sku,
    description,
    category_id,
    base_price,
    cost_price,
    type,
    preferred_vendor_id,
    service_provider,
    service_sla,
    stock,
    unit,
    image_url,
    is_active
  } = data;

  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const validCategoryId = category_id && uuidRegex.test(category_id) ? category_id : null;

  const query = `
    INSERT INTO products (
      company_id, name, sku, description, category_id, base_price, cost_price,
      type, preferred_vendor_id, service_provider, service_sla, stock, unit, image_url, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING ${PRODUCT_FIELDS}
  `;
  const values = [
    resolvedCompanyId,
    name,
    sku || null,
    description || null,
    validCategoryId,
    base_price || 0,
    cost_price || 0,
    type || 'PHYSICAL',
    preferred_vendor_id || null,
    service_provider || null,
    service_sla || null,
    stock !== undefined ? stock : 100,
    unit || 'Units',
    image_url || null,
    is_active !== undefined ? is_active : true
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getProducts = async (company_id, filters = {}) => {
  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const conditions = [];
  const values = [];
  let i = 1;

  if (resolvedCompanyId) {
    conditions.push(`(company_id = $${i} OR company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1))`);
    values.push(resolvedCompanyId);
    i++;
  }

  if (filters.category_id && uuidRegex.test(filters.category_id)) {
    conditions.push(`category_id = $${i}`);
    values.push(filters.category_id);
    i++;
  }
  
  if (filters.is_active !== undefined) {
    conditions.push(`is_active = $${i}`);
    values.push(filters.is_active === 'true' || filters.is_active === true);
    i++;
  }

  if (filters.type) {
    conditions.push(`type = $${i}`);
    values.push(filters.type);
    i++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT ${PRODUCT_FIELDS} FROM products ${whereClause} ORDER BY created_at DESC, name ASC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getProductByIdAndCompany = async (id, company_id) => {
  if (!uuidRegex.test(id)) return null;
  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const result = await db.query(
    `SELECT ${PRODUCT_FIELDS} FROM products WHERE id = $1 AND (company_id = $2 OR company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1))`,
    [id, resolvedCompanyId]
  );
  return result.rows[0];
};

const updateProduct = async (id, company_id, data) => {
  if (!uuidRegex.test(id)) return null;
  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const allowedFields = [
    'name', 'sku', 'description', 'category_id', 'base_price', 'cost_price',
    'type', 'preferred_vendor_id', 'service_provider', 'service_sla', 'stock',
    'unit', 'image_url', 'is_active'
  ];
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      if (key === 'category_id') {
        const val = data[key] && uuidRegex.test(data[key]) ? data[key] : null;
        fields.push(`${key} = $${i}`);
        values.push(val);
      } else {
        fields.push(`${key} = $${i}`);
        values.push(data[key]);
      }
      i++;
    }
  }

  if (fields.length === 0) return getProductByIdAndCompany(id, resolvedCompanyId);

  fields.push(`updated_at = NOW()`);
  values.push(id, resolvedCompanyId);

  const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${PRODUCT_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id, company_id) => {
  if (!uuidRegex.test(id)) return null;
  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const result = await db.query(
    `DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, resolvedCompanyId]
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
