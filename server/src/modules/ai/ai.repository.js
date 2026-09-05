const db = require('../../config/database');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveCompanyId = async (company_id) => {
  if (company_id && UUID_REGEX.test(company_id)) {
    return company_id;
  }
  try {
    const res = await db.query('SELECT id FROM companies LIMIT 1');
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
  } catch (err) {
    // DB unreachable or table not yet created
  }
  return null;
};

/**
 * Fetch recent audit logs with user info for change explanation
 */
const getRecentAuditLogs = async (company_id, limit = 20) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    const query = `
      SELECT 
        a.id, a.company_id, a.user_id, a.action, a.entity_type, a.entity_id,
        a.before_state, a.after_state, a.reason, a.created_at,
        u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.company_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [compId, limit]);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Fetch audit logs for a specific entity
 */
const getAuditLogsByEntity = async (company_id, entityType, entityId) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId || !UUID_REGEX.test(entityId)) return [];

  try {
    const query = `
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id,
        a.before_state, a.after_state, a.reason, a.created_at,
        u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.company_id = $1 AND a.entity_type = $2 AND a.entity_id = $3
      ORDER BY a.created_at DESC
      LIMIT 20
    `;
    const result = await db.query(query, [compId, entityType, entityId]);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Search and retrieve quotations with customer and line items
 */
const searchQuotes = async (company_id, searchTerm = '') => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    let query = `
      SELECT 
        q.id, q.status, q.subtotal, q.discount_total, q.tax_total, q.total, q.valid_until, q.created_at,
        c.name as customer_name, c.industry as customer_industry,
        u.name as creator_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.company_id = $1
    `;
    const values = [compId];

    if (searchTerm) {
      query += ` AND (c.name ILIKE $2 OR q.id::text ILIKE $2 OR q.status ILIKE $2)`;
      values.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY q.created_at DESC LIMIT 15`;
    const result = await db.query(query, values);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Get quotation detail with its line items
 */
const getQuoteWithLines = async (company_id, quoteId) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId || !UUID_REGEX.test(quoteId)) return null;

  try {
    const quoteQuery = `
      SELECT 
        q.id, q.status, q.subtotal, q.discount_total, q.tax_total, q.total, q.valid_until, q.created_at,
        c.id as customer_id, c.name as customer_name,
        u.name as creator_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1 AND q.company_id = $2
    `;
    const quoteRes = await db.query(quoteQuery, [quoteId, compId]);
    if (quoteRes.rows.length === 0) return null;

    const quote = quoteRes.rows[0];

    const linesQuery = `
      SELECT 
        ql.id, ql.product_id, ql.quantity, ql.unit_price, ql.discount_percent, ql.line_total,
        p.name as product_name, p.sku as product_sku, p.base_price
      FROM quotation_lines ql
      LEFT JOIN products p ON ql.product_id = p.id
      WHERE ql.quotation_id = $1 AND ql.company_id = $2
    `;
    const linesRes = await db.query(linesQuery, [quoteId, compId]);
    quote.lines = linesRes.rows;

    return quote;
  } catch (err) {
    return null;
  }
};

/**
 * Search and retrieve leads with interaction count
 */
const searchLeads = async (company_id, searchTerm = '') => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    let query = `
      SELECT 
        l.id, l.lead_number, l.first_name, l.last_name, l.company_name, l.email, l.phone,
        l.source, l.priority, l.status, l.qualification_status, l.lead_score, l.estimated_budget,
        l.created_at, u.name as assigned_user_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_user_id = u.id
      WHERE l.company_id = $1
    `;
    const values = [compId];

    if (searchTerm) {
      query += ` AND (l.first_name ILIKE $2 OR l.last_name ILIKE $2 OR l.company_name ILIKE $2 OR l.lead_number ILIKE $2 OR l.status ILIKE $2)`;
      values.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY l.lead_score DESC, l.created_at DESC LIMIT 15`;
    const result = await db.query(query, values);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Search products and get current inventory across warehouses
 */
const searchProductsAndInventory = async (company_id, searchTerm = '') => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    let query = `
      SELECT 
        p.id, p.name, p.sku, p.description, p.base_price, p.is_active,
        pc.name as category_name,
        COALESCE(SUM(inv.quantity_on_hand), 0)::int as total_on_hand,
        COALESCE(SUM(inv.quantity_reserved), 0)::int as total_reserved,
        COALESCE(SUM(inv.quantity_on_hand - inv.quantity_reserved), 0)::int as total_available
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN inventory inv ON p.id = inv.product_id AND inv.company_id = $1
      WHERE p.company_id = $1
    `;
    const values = [compId];

    if (searchTerm) {
      query += ` AND (p.name ILIKE $2 OR p.sku ILIKE $2 OR pc.name ILIKE $2)`;
      values.push(`%${searchTerm}%`);
    }

    query += ` GROUP BY p.id, pc.name ORDER BY p.name ASC LIMIT 20`;
    const result = await db.query(query, values);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Get warehouse breakdown for a specific product
 */
const getProductWarehouseStock = async (company_id, productId) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId || !UUID_REGEX.test(productId)) return [];

  try {
    const query = `
      SELECT 
        w.id as warehouse_id, w.name as warehouse_name, w.location,
        inv.quantity_on_hand, inv.quantity_reserved,
        (inv.quantity_on_hand - inv.quantity_reserved) as quantity_available
      FROM inventory inv
      JOIN warehouses w ON inv.warehouse_id = w.id
      WHERE inv.company_id = $1 AND inv.product_id = $2
    `;
    const result = await db.query(query, [compId, productId]);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Get invoices and billing overview
 */
const getBillingOverview = async (company_id) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    const query = `
      SELECT 
        inv.id, inv.status, inv.subtotal, inv.tax_total, inv.total, inv.due_date, inv.created_at,
        c.name as customer_name
      FROM invoices inv
      LEFT JOIN customers c ON inv.customer_id = c.id
      WHERE inv.company_id = $1
      ORDER BY inv.created_at DESC
      LIMIT 15
    `;
    const result = await db.query(query, [compId]);
    return result.rows;
  } catch (err) {
    return [];
  }
};

/**
 * Get recent activities / touchpoints
 */
const getRecentActivities = async (company_id, limit = 20) => {
  const compId = await resolveCompanyId(company_id);
  if (!compId) return [];

  try {
    const query = `
      SELECT 
        act.id, act.entity_type, act.entity_id, act.interaction_type, act.notes,
        act.outcome, act.next_followup_at, act.created_at,
        u.name as user_name
      FROM activities act
      LEFT JOIN users u ON act.user_id = u.id
      WHERE act.company_id = $1
      ORDER BY act.created_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [compId, limit]);
    return result.rows;
  } catch (err) {
    return [];
  }
};

module.exports = {
  resolveCompanyId,
  getRecentAuditLogs,
  getAuditLogsByEntity,
  searchQuotes,
  getQuoteWithLines,
  searchLeads,
  searchProductsAndInventory,
  getProductWarehouseStock,
  getBillingOverview,
  getRecentActivities,
};
