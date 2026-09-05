const db = require('../../config/database');

const CONTACT_FIELDS = `
  id, company_id, customer_id, first_name, last_name, email, phone, job_title, is_primary,
  created_at, updated_at
`;

const createContact = async (data) => {
  const { company_id, customer_id, first_name, last_name, email, phone, job_title, is_primary } = data;

  const query = `
    INSERT INTO contacts (
      company_id, customer_id, first_name, last_name, email, phone, job_title, is_primary
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${CONTACT_FIELDS}
  `;
  const values = [
    company_id,
    customer_id,
    first_name,
    last_name || null,
    email || null,
    phone || null,
    job_title || null,
    is_primary || false
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getContacts = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.customer_id) {
    conditions.push(`customer_id = $${i}`);
    values.push(filters.customer_id);
    i++;
  }

  const query = `SELECT ${CONTACT_FIELDS} FROM contacts WHERE ${conditions.join(' AND ')} ORDER BY first_name ASC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getContactByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${CONTACT_FIELDS} FROM contacts WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updateContact = async (id, company_id, data) => {
  const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'job_title', 'is_primary'];
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

  if (fields.length === 0) return getContactByIdAndCompany(id, company_id);

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${CONTACT_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteContact = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM contacts WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createContact,
  getContacts,
  getContactByIdAndCompany,
  updateContact,
  deleteContact
};
