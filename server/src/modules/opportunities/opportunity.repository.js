const db = require('../../config/database');

const OPPORTUNITY_FIELDS = `
  id, company_id, customer_id, name, amount, stage, probability, expected_close_date, assigned_user_id,
  created_at, updated_at
`;

const createOpportunity = async (data) => {
  const { company_id, customer_id, name, amount, stage, probability, expected_close_date, assigned_user_id } = data;

  const query = `
    INSERT INTO opportunities (
      company_id, customer_id, name, amount, stage, probability, expected_close_date, assigned_user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${OPPORTUNITY_FIELDS}
  `;
  const values = [
    company_id,
    customer_id,
    name,
    amount || 0,
    stage || 'PROSPECTING',
    probability || 10,
    expected_close_date || null,
    assigned_user_id || null
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getOpportunities = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.customer_id) {
    conditions.push(`customer_id = $${i}`);
    values.push(filters.customer_id);
    i++;
  }
  
  if (filters.stage) {
    conditions.push(`stage = $${i}`);
    values.push(filters.stage);
    i++;
  }

  const query = `SELECT ${OPPORTUNITY_FIELDS} FROM opportunities WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getOpportunityByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${OPPORTUNITY_FIELDS} FROM opportunities WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updateOpportunity = async (id, company_id, data) => {
  const allowedFields = ['name', 'amount', 'stage', 'probability', 'expected_close_date', 'assigned_user_id'];
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

  if (fields.length === 0) return getOpportunityByIdAndCompany(id, company_id);

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE opportunities SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${OPPORTUNITY_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteOpportunity = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM opportunities WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunityByIdAndCompany,
  updateOpportunity,
  deleteOpportunity
};
