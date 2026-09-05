const db = require('../../config/database');

const getSalesFunnel = async (company_id) => {
  const query = `
    SELECT stage, COUNT(id) as count, SUM(amount) as total_value
    FROM opportunities
    WHERE company_id = $1
    GROUP BY stage
    ORDER BY total_value DESC
  `;
  const result = await db.query(query, [company_id]);
  return result.rows;
};

const getRevenueForecast = async (company_id) => {
  const query = `
    SELECT 
      TO_CHAR(expected_close_date, 'YYYY-MM') as month,
      SUM(amount * (probability / 100.0)) as projected_revenue
    FROM opportunities
    WHERE company_id = $1 AND stage NOT IN ('CLOSED_WON', 'CLOSED_LOST') AND expected_close_date IS NOT NULL
    GROUP BY TO_CHAR(expected_close_date, 'YYYY-MM')
    ORDER BY month ASC
  `;
  const result = await db.query(query, [company_id]);
  return result.rows;
};

const getWinRate = async (company_id) => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE stage = 'CLOSED_WON') as won,
      COUNT(*) FILTER (WHERE stage = 'CLOSED_LOST') as lost,
      COUNT(*) FILTER (WHERE stage IN ('CLOSED_WON', 'CLOSED_LOST')) as total_closed
    FROM opportunities
    WHERE company_id = $1
  `;
  const result = await db.query(query, [company_id]);
  return result.rows[0];
};

const getFinancialSummary = async (company_id) => {
  const query = `
    SELECT 
      COUNT(*) as total_invoices,
      SUM(total) FILTER (WHERE status = 'PAID') as collected_revenue,
      SUM(total) FILTER (WHERE status IN ('ISSUED', 'OVERDUE')) as outstanding_revenue,
      SUM(total) FILTER (WHERE status = 'OVERDUE') as overdue_revenue
    FROM invoices
    WHERE company_id = $1
  `;
  const result = await db.query(query, [company_id]);
  return result.rows[0];
};

module.exports = {
  getSalesFunnel,
  getRevenueForecast,
  getWinRate,
  getFinancialSummary
};
