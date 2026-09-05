const db = require('../../config/database');

const ACTIVITY_FIELDS = `
  id, company_id, entity_type, entity_id, interaction_type, notes, outcome, next_followup_at, user_id,
  created_at, updated_at
`;

const createActivity = async (data) => {
  const { company_id, entity_type, entity_id, interaction_type, notes, outcome, next_followup_at, user_id } = data;

  const query = `
    INSERT INTO activities (
      company_id, entity_type, entity_id, interaction_type, notes, outcome, next_followup_at, user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${ACTIVITY_FIELDS}
  `;
  const values = [
    company_id,
    entity_type,
    entity_id,
    interaction_type,
    notes || null,
    outcome || null,
    next_followup_at || null,
    user_id || null
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getActivities = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.entity_type) {
    conditions.push(`entity_type = $${i}`);
    values.push(filters.entity_type);
    i++;
  }
  
  if (filters.entity_id) {
    conditions.push(`entity_id = $${i}`);
    values.push(filters.entity_id);
    i++;
  }

  const query = `SELECT ${ACTIVITY_FIELDS} FROM activities WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getActivityByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${ACTIVITY_FIELDS} FROM activities WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updateActivity = async (id, company_id, data) => {
  const allowedFields = ['interaction_type', 'notes', 'outcome', 'next_followup_at'];
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

  if (fields.length === 0) return getActivityByIdAndCompany(id, company_id);

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE activities SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${ACTIVITY_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteActivity = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM activities WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createActivity,
  getActivities,
  getActivityByIdAndCompany,
  updateActivity,
  deleteActivity
};
