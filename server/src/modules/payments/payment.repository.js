const db = require('../../config/database');

const PAYMENT_FIELDS = `
  id, company_id, invoice_id, customer_id, amount, payment_method, payment_date, reference_number, created_at
`;

const registerPaymentTransaction = async (data) => {
  const { company_id, invoice_id, customer_id, amount, payment_method, reference_number } = data;
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Lock the invoice row to prevent race conditions during payment registration
    const invRes = await client.query(
      `SELECT * FROM invoices WHERE id = $1 AND company_id = $2 FOR UPDATE`,
      [invoice_id, company_id]
    );
    
    if (invRes.rows.length === 0) {
      throw new Error('Invoice not found');
    }
    const invoice = invRes.rows[0];

    if (invoice.status === 'PAID') {
      throw new Error('Invoice is already fully paid');
    }

    // Insert payment
    const paymentQuery = `
      INSERT INTO payments (company_id, invoice_id, customer_id, amount, payment_method, reference_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${PAYMENT_FIELDS}
    `;
    const paymentRes = await client.query(paymentQuery, [
      company_id, 
      invoice_id, 
      customer_id, 
      amount, 
      payment_method, 
      reference_number || null
    ]);
    const payment = paymentRes.rows[0];
    
    // Check total paid
    const sumRes = await client.query(
      `SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = $1 AND company_id = $2`,
      [invoice_id, company_id]
    );
    const totalPaid = Number(sumRes.rows[0].total_paid) || 0;
    
    // If total paid >= invoice total, update status to PAID
    if (totalPaid >= Number(invoice.total)) {
      await client.query(
        `UPDATE invoices SET status = 'PAID', updated_at = NOW() WHERE id = $1 AND company_id = $2`,
        [invoice_id, company_id]
      );
      payment.invoice_status_updated_to = 'PAID';
    }

    await client.query('COMMIT');
    return payment;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getPayments = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.invoice_id) {
    conditions.push(`invoice_id = $${i}`);
    values.push(filters.invoice_id);
    i++;
  }
  
  if (filters.customer_id) {
    conditions.push(`customer_id = $${i}`);
    values.push(filters.customer_id);
    i++;
  }

  const query = `SELECT ${PAYMENT_FIELDS} FROM payments WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getPaymentByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${PAYMENT_FIELDS} FROM payments WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  registerPaymentTransaction,
  getPayments,
  getPaymentByIdAndCompany
};
