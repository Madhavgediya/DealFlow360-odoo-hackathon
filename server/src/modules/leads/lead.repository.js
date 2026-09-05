const db = require('../../config/database');

const LEAD_FIELDS = `
  id, company_id, lead_number, first_name, last_name, company_name,
  email, phone, source, campaign, industry, country, city,
  estimated_budget, requirement, priority, assigned_user_id,
  status, qualification_status, lead_score, score_band,
  trial_status, trial_started_at, trial_ends_at, converted_customer_id,
  created_at, updated_at
`;

const getNextLeadNumber = async (company_id) => {
  const result = await db.query(
    `SELECT COUNT(*) FROM leads WHERE company_id = $1`,
    [company_id]
  );
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `LEAD-${String(count).padStart(5, '0')}`;
};

const createLead = async (data) => {
  const {
    company_id, lead_number, first_name, last_name, company_name,
    email, phone, source, campaign, industry, country, city,
    estimated_budget, requirement, priority, assigned_user_id,
    status, qualification_status, lead_score, score_band,
    trial_status, trial_started_at, trial_ends_at
  } = data;

  const query = `
    INSERT INTO leads (
      company_id, lead_number, first_name, last_name, company_name,
      email, phone, source, campaign, industry, country, city,
      estimated_budget, requirement, priority, assigned_user_id,
      status, qualification_status, lead_score, score_band,
      trial_status, trial_started_at, trial_ends_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
    RETURNING ${LEAD_FIELDS}
  `;
  const values = [
    company_id, lead_number, first_name, last_name || null, company_name || null,
    email || null, phone || null, source || null, campaign || null, industry || null,
    country || null, city || null, estimated_budget || null, requirement || null,
    priority || 'MEDIUM', assigned_user_id || null,
    status || 'NEW', qualification_status || 'UNQUALIFIED',
    lead_score || 0, score_band || null,
    trial_status || null, trial_started_at || null, trial_ends_at || null
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getLeads = async (company_id, filters = {}) => {
  const conditions = ['l.company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.status && filters.status !== 'ALL') { conditions.push(`l.status = $${i}`); values.push(filters.status); i++; }
  if (filters.assigned_user_id) { conditions.push(`l.assigned_user_id = $${i}`); values.push(filters.assigned_user_id); i++; }
  if (filters.from_date) { conditions.push(`l.created_at >= $${i}`); values.push(filters.from_date); i++; }
  if (filters.to_date) { conditions.push(`l.created_at <= $${i}`); values.push(filters.to_date); i++; }

  const query = `
    SELECT 
      l.id, l.company_id, l.lead_number, l.first_name, l.last_name, l.company_name,
      l.email, l.phone, l.source, l.campaign, l.industry, l.country, l.city,
      l.estimated_budget, l.requirement, l.priority, l.assigned_user_id,
      l.status, l.qualification_status, l.lead_score, l.score_band,
      l.trial_status, l.trial_started_at, l.trial_ends_at, l.converted_customer_id,
      l.created_at, l.updated_at,
      u.name as assigned_user_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.assigned_user_id
    WHERE ${conditions.join(' AND ')} 
    ORDER BY l.created_at DESC
  `;
  const result = await db.query(query, values);
  return result.rows;
};

const getLeadByIdAndCompany = async (id, company_id) => {
  const query = `
    SELECT 
      l.id, l.company_id, l.lead_number, l.first_name, l.last_name, l.company_name,
      l.email, l.phone, l.source, l.campaign, l.industry, l.country, l.city,
      l.estimated_budget, l.requirement, l.priority, l.assigned_user_id,
      l.status, l.qualification_status, l.lead_score, l.score_band,
      l.trial_status, l.trial_started_at, l.trial_ends_at, l.converted_customer_id,
      l.created_at, l.updated_at,
      u.name as assigned_user_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.assigned_user_id
    WHERE l.id = $1 AND l.company_id = $2
  `;
  const result = await db.query(query, [id, company_id]);
  return result.rows[0];
};

const updateLead = async (id, company_id, data) => {
  const allowedFields = [
    'first_name', 'last_name', 'company_name', 'email', 'phone', 'source', 'campaign',
    'industry', 'country', 'city', 'estimated_budget', 'requirement', 'priority',
    'assigned_user_id', 'status', 'qualification_status', 'lead_score', 'score_band',
    'trial_status', 'trial_started_at', 'trial_ends_at'
  ];
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

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${LEAD_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateLeadStatus = async (id, company_id, status) => {
  const result = await db.query(
    `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING ${LEAD_FIELDS}`,
    [status, id, company_id]
  );
  return result.rows[0];
};

const deleteLead = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM leads WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = { getNextLeadNumber, createLead, getLeads, getLeadByIdAndCompany, updateLead, updateLeadStatus, deleteLead };
