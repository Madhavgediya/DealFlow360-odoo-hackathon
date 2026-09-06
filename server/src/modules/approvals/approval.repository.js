const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createApprovalRequest = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO approval_requests
      (company_id, quotation_id, requested_by, risk_score, risk_severity,
       discount_percentage, gross_margin_percentage, total_amount,
       required_level, status, reasons, blended_risk_details)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING',$10,$11)
     RETURNING *`,
    [
      data.company_id, data.quotation_id, data.requested_by,
      data.risk_score, data.risk_severity, data.discount_percentage,
      data.gross_margin_percentage, data.total_amount,
      data.required_level, JSON.stringify(data.reasons),
      JSON.stringify(data.blended_risk_details || {})
    ]
  );
  return rows[0];
};

const getApprovalsByCompany = async (company_id, filters = {}) => {
  let query = `SELECT ar.*, 
    q.subtotal, q.discount_total, q.total,
    u.name as requester_name, u.role as requester_role,
    c.name as customer_name
    FROM approval_requests ar
    LEFT JOIN quotations q ON ar.quotation_id = q.id
    LEFT JOIN users u ON ar.requested_by = u.id
    LEFT JOIN customers c ON q.customer_id = c.id
    WHERE ar.company_id = $1`;
  const params = [company_id];

  if (filters.status) {
    params.push(filters.status);
    query += ` AND ar.status = $${params.length}`;
  }
  query += ` ORDER BY ar.created_at DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getApprovalById = async (id, company_id) => {
  const { rows } = await pool.query(
    `SELECT ar.*, 
      q.subtotal, q.discount_total, q.total,
      u.name as requester_name, u.role as requester_role,
      c.name as customer_name
      FROM approval_requests ar
      LEFT JOIN quotations q ON ar.quotation_id = q.id
      LEFT JOIN users u ON ar.requested_by = u.id
      LEFT JOIN customers c ON q.customer_id = c.id
      WHERE ar.id = $1 AND ar.company_id = $2`,
    [id, company_id]
  );
  return rows[0];
};

const getApprovalByQuotationId = async (quotation_id, company_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM approval_requests WHERE quotation_id = $1 AND company_id = $2 ORDER BY created_at DESC LIMIT 1`,
    [quotation_id, company_id]
  );
  return rows[0];
};

const updateApprovalStatus = async (id, company_id, status) => {
  const { rows } = await pool.query(
    `UPDATE approval_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING *`,
    [status, id, company_id]
  );
  return rows[0];
};

const addAuditEntry = async (approval_id, company_id, entry) => {
  // Store audit trail as JSONB append
  const { rows } = await pool.query(
    `UPDATE approval_requests 
     SET audit_trail = COALESCE(audit_trail, '[]'::jsonb) || $1::jsonb,
         updated_at = NOW()
     WHERE id = $2 AND company_id = $3
     RETURNING *`,
    [JSON.stringify([entry]), approval_id, company_id]
  );
  return rows[0];
};

module.exports = {
  createApprovalRequest,
  getApprovalsByCompany,
  getApprovalById,
  getApprovalByQuotationId,
  updateApprovalStatus,
  addAuditEntry,
};
