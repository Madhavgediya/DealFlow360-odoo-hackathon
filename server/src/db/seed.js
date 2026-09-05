require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  console.log('Starting seed...');

  try {
    await client.query('BEGIN');

    // 0. Cleanup
    console.log('Wiping existing data (except migrations)...');
    const tables = [
      'payments', 'invoice_lines', 'invoices',
      'stock_movements', 'inventory', 'warehouses',
      'sales_order_lines', 'sales_orders',
      'quotation_lines', 'quotations',
      'price_list_items', 'price_lists',
      'products', 'product_categories',
      'activities', 'opportunities',
      'contacts', 'customers',
      'audit_logs', 'lead_interactions', 'leads',
      'user_roles', 'permissions',
      'roles', 'users', 'companies'
    ];

    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
    }

    // 1. Company
    console.log('Seeding company...');
    const companyRes = await client.query(`
      INSERT INTO companies (name, legal_name, code) VALUES ('Acme Corp', 'Acme Corporation Inc.', 'ACME') RETURNING id
    `);
    const companyId = companyRes.rows[0].id;

    // 2. Roles & Permissions
    console.log('Seeding roles & permissions...');
    const adminRole = await client.query(`INSERT INTO roles (company_id, name, code, description) VALUES ($1, 'Admin', 'ADMIN', 'Administrator') RETURNING id`, [companyId]);
    const salesManagerRole = await client.query(`INSERT INTO roles (company_id, name, code, description) VALUES ($1, 'Sales Manager', 'SALES_MANAGER', 'Sales Manager') RETURNING id`, [companyId]);
    const salesRepRole = await client.query(`INSERT INTO roles (company_id, name, code, description) VALUES ($1, 'Sales Rep', 'SALES_REP', 'Sales Representative') RETURNING id`, [companyId]);

    const adminRoleId = adminRole.rows[0].id;
    const salesManagerRoleId = salesManagerRole.rows[0].id;
    const salesRepRoleId = salesRepRole.rows[0].id;

    await client.query(`
      INSERT INTO permissions (module, action, resource, description) VALUES 
      ('users', 'manage', '*', 'Manage users'), 
      ('billing', 'manage', '*', 'Manage billing')
    `);

    // 3. Users
    console.log('Seeding users...');
    const hash = await bcrypt.hash('admin123', 10);
    const adminUser = await client.query(`
      INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, name)
      VALUES ($1, 'admin@acme.com', $2, 'Admin', 'User', 'ADMIN', 'Admin User') RETURNING id
    `, [companyId, hash]);
    
    const managerUser = await client.query(`
      INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, name)
      VALUES ($1, 'manager@acme.com', $2, 'Sales', 'Manager', 'SALES_MANAGER', 'Sales Manager') RETURNING id
    `, [companyId, hash]);

    const repUser1 = await client.query(`
      INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, name)
      VALUES ($1, 'rep1@acme.com', $2, 'John', 'Doe', 'SALES_REP', 'John Doe') RETURNING id
    `, [companyId, hash]);

    const adminUserId = adminUser.rows[0].id;
    const managerUserId = managerUser.rows[0].id;
    const repUserId = repUser1.rows[0].id;

    await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [adminUserId, adminRoleId]);
    await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [managerUserId, salesManagerRoleId]);
    await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [repUserId, salesRepRoleId]);

    // 4. Products & Categories
    console.log('Seeding products...');
    const catRes = await client.query(`
      INSERT INTO product_categories (company_id, name, description) VALUES ($1, 'Software', 'Software products and licenses') RETURNING id
    `, [companyId]);
    const catId = catRes.rows[0].id;

    const p1Res = await client.query(`
      INSERT INTO products (company_id, category_id, name, sku, description, base_price, is_active)
      VALUES ($1, $2, 'Enterprise License (Annual)', 'ENT-LIC-1Y', 'Annual enterprise license', 12000.00, true) RETURNING id
    `, [companyId, catId]);
    
    const p2Res = await client.query(`
      INSERT INTO products (company_id, category_id, name, sku, description, base_price, is_active)
      VALUES ($1, $2, 'Server Hardware', 'SRV-HW-01', 'Standard server hardware', 5000.00, true) RETURNING id
    `, [companyId, catId]);

    const p1Id = p1Res.rows[0].id;
    const p2Id = p2Res.rows[0].id;

    // 5. Inventory (For physical goods)
    console.log('Seeding inventory...');
    const whRes = await client.query(`
      INSERT INTO warehouses (company_id, name, location) VALUES ($1, 'Main Warehouse', 'New York') RETURNING id
    `, [companyId]);
    const whId = whRes.rows[0].id;

    await client.query(`
      INSERT INTO inventory (company_id, warehouse_id, product_id, quantity_on_hand)
      VALUES ($1, $2, $3, 100)
    `, [companyId, whId, p2Id]);

    // 6. Customers & Contacts
    console.log('Seeding customers...');
    const cust1Res = await client.query(`
      INSERT INTO customers (company_id, name, industry, status) VALUES ($1, 'Stark Industries', 'Technology', 'ACTIVE') RETURNING id
    `, [companyId]);
    const cust1Id = cust1Res.rows[0].id;

    const cust2Res = await client.query(`
      INSERT INTO customers (company_id, name, industry, status) VALUES ($1, 'Wayne Enterprises', 'Finance', 'ACTIVE') RETURNING id
    `, [companyId]);
    const cust2Id = cust2Res.rows[0].id;

    // 7. Opportunities
    console.log('Seeding opportunities...');
    // Won Opportunity
    const opp1Res = await client.query(`
      INSERT INTO opportunities (company_id, customer_id, name, amount, probability, stage, expected_close_date)
      VALUES ($1, $2, 'Q3 Server Upgrade', 25000.00, 100, 'CLOSED_WON', NOW() - INTERVAL '5 days') RETURNING id
    `, [companyId, cust1Id]);
    const opp1Id = opp1Res.rows[0].id;

    // Open Opportunity
    await client.query(`
      INSERT INTO opportunities (company_id, customer_id, name, amount, probability, stage, expected_close_date)
      VALUES ($1, $2, 'Q4 Enterprise Licensing', 36000.00, 60, 'PROSPECTING', NOW() + INTERVAL '30 days')
    `, [companyId, cust2Id]);

    // 8. Quotations & Orders
    console.log('Seeding quotations & orders...');
    const quoteRes = await client.query(`
      INSERT INTO quotations (company_id, customer_id, opportunity_id, status, subtotal, total, created_by)
      VALUES ($1, $2, $3, 'ACCEPTED', 25000.00, 25000.00, $4) RETURNING id
    `, [companyId, cust1Id, opp1Id, repUserId]);
    const quoteId = quoteRes.rows[0].id;
    
    await client.query(`
      INSERT INTO quotation_lines (company_id, quotation_id, product_id, quantity, unit_price, line_total)
      VALUES ($1, $2, $3, 5, 5000.00, 25000.00)
    `, [companyId, quoteId, p2Id]);

    const orderRes = await client.query(`
      INSERT INTO sales_orders (company_id, quotation_id, customer_id, status, total)
      VALUES ($1, $2, $3, 'CONFIRMED', 25000.00) RETURNING id
    `, [companyId, quoteId, cust1Id]);
    const orderId = orderRes.rows[0].id;

    await client.query(`
      INSERT INTO sales_order_lines (company_id, order_id, product_id, quantity, unit_price, line_total)
      VALUES ($1, $2, $3, 5, 5000.00, 25000.00)
    `, [companyId, orderId, p2Id]);

    // 9. Invoice
    console.log('Seeding invoices & payments...');
    const invoiceRes = await client.query(`
      INSERT INTO invoices (company_id, order_id, customer_id, status, subtotal, total)
      VALUES ($1, $2, $3, 'ISSUED', 25000.00, 25000.00) RETURNING id
    `, [companyId, orderId, cust1Id]);
    const invoiceId = invoiceRes.rows[0].id;

    await client.query(`
      INSERT INTO invoice_lines (company_id, invoice_id, product_id, quantity, unit_price, line_total)
      VALUES ($1, $2, $3, 5, 5000.00, 25000.00)
    `, [companyId, invoiceId, p2Id]);

    // 10. Payment (Partial)
    await client.query(`
      INSERT INTO payments (company_id, invoice_id, customer_id, amount, payment_method)
      VALUES ($1, $2, $3, 15000.00, 'BANK_TRANSFER')
    `, [companyId, invoiceId, cust1Id]);

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Login credentials:');
    console.log('Email: admin@acme.com');
    console.log('Password: admin123');
    console.log('--------------------------------------------------');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
