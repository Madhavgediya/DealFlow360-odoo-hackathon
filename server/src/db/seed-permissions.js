require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  console.log('Connected to DB');

  try {
    const perms = await client.query('SELECT count(*) FROM permissions');
    console.log('Permissions in DB:', perms.rows[0].count);

    const companies = await client.query('SELECT id, name FROM companies');
    console.log('Companies found:', companies.rows.map(c => ({ id: c.id, name: c.name })));

    const roles = [
      { name: 'Company Administrator', code: 'ADMIN', desc: 'Full enterprise admin access' },
      { name: 'Sales Manager', code: 'SALES_MANAGER', desc: 'Sales & Deal desk director' },
      { name: 'Sales Representative', code: 'SALES_REP', desc: 'Commercial lead closer & CPQ quoter' },
      { name: 'Finance & Billing Director', code: 'FINANCE', desc: 'Invoices, credit lines & collections' },
      { name: 'Operations & Fulfillment', code: 'OPERATIONS', desc: 'Inventory stock & order fulfillment' },
      { name: 'B2B Retailer Partner', code: 'RETAILER', desc: 'Authorized wholesale dealer portal' }
    ];

    for (const comp of companies.rows) {
      console.log('Processing company:', comp.name, comp.id);
      for (const r of roles) {
        const res = await client.query(`
          INSERT INTO roles (company_id, name, code, description, is_system)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (company_id, code) DO NOTHING
          RETURNING id
        `, [comp.id, r.name, r.code, r.desc]);
        console.log('  Role:', r.code, res.rows.length ? 'inserted' : 'existed');
      }
    }

    // Now assign all permissions to ADMIN roles
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'ADMIN'
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);
    console.log('Assigned all permissions to ADMIN roles.');

    // Assign CRM & Quote permissions to Sales Manager & Rep
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code IN ('SALES_MANAGER', 'SALES_REP')
        AND p.module IN ('crm', 'quote', 'negotiation', 'inventory', 'ai', 'analytics')
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);
    console.log('Assigned permissions to Sales roles.');

    // Assign Finance permissions
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'FINANCE'
        AND (p.module IN ('billing', 'retailer', 'analytics') OR p.action LIKE 'quote.view' OR p.action LIKE 'quote.approve')
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);

    // Assign Retailer permissions
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'RETAILER'
        AND (p.action IN ('quote.view', 'quote.create', 'quote.negotiate', 'inventory.view', 'billing.view'))
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);

    // Sync user_roles
    const synced = await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u
      JOIN roles r ON r.company_id = u.company_id AND r.code = u.role
      ON CONFLICT (user_id, role_id) DO NOTHING
    `);
    console.log('Synced user_roles, affected rows:', synced.rowCount);

    console.log('ALL DONE SUCCESSFULLY!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
