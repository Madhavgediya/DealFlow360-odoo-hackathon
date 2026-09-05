const db = require('../../config/database');

const PRICE_LIST_FIELDS = `
  id, company_id, name, currency, is_active, created_at
`;

const PRICE_LIST_ITEM_FIELDS = `
  id, company_id, price_list_id, product_id, price
`;

const createPriceList = async (data) => {
  const { company_id, name, currency, is_active } = data;

  const query = `
    INSERT INTO price_lists (
      company_id, name, currency, is_active
    ) VALUES ($1, $2, $3, $4)
    RETURNING ${PRICE_LIST_FIELDS}
  `;
  const values = [
    company_id,
    name,
    currency || 'USD',
    is_active !== undefined ? is_active : true
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getPriceLists = async (company_id) => {
  const query = `SELECT ${PRICE_LIST_FIELDS} FROM price_lists WHERE company_id = $1 ORDER BY name ASC`;
  const result = await db.query(query, [company_id]);
  return result.rows;
};

const getPriceListByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${PRICE_LIST_FIELDS} FROM price_lists WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updatePriceList = async (id, company_id, data) => {
  const allowedFields = ['name', 'currency', 'is_active'];
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

  if (fields.length === 0) return getPriceListByIdAndCompany(id, company_id);

  values.push(id, company_id);

  const query = `UPDATE price_lists SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${PRICE_LIST_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const addPriceListItem = async (data) => {
  const { company_id, price_list_id, product_id, price } = data;
  
  const query = `
    INSERT INTO price_list_items (
      company_id, price_list_id, product_id, price
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (price_list_id, product_id)
    DO UPDATE SET price = EXCLUDED.price
    RETURNING ${PRICE_LIST_ITEM_FIELDS}
  `;
  const values = [company_id, price_list_id, product_id, price];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getPriceListItems = async (price_list_id, company_id) => {
  const query = `
    SELECT pli.*, p.name as product_name, p.sku 
    FROM price_list_items pli
    JOIN products p ON p.id = pli.product_id
    WHERE pli.price_list_id = $1 AND pli.company_id = $2
  `;
  const result = await db.query(query, [price_list_id, company_id]);
  return result.rows;
};

// Crucial function for server-authoritative logic
const getProductPriceFromList = async (price_list_id, product_id, company_id) => {
  const query = `
    SELECT price FROM price_list_items
    WHERE price_list_id = $1 AND product_id = $2 AND company_id = $3
  `;
  const result = await db.query(query, [price_list_id, product_id, company_id]);
  return result.rows[0]?.price;
};

module.exports = {
  createPriceList,
  getPriceLists,
  getPriceListByIdAndCompany,
  updatePriceList,
  addPriceListItem,
  getPriceListItems,
  getProductPriceFromList
};
