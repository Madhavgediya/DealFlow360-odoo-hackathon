require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const runMigration = async () => {
  console.log('Starting database migration...');
  try {
    const queries = [
      `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
      
      `CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        legal_name VARCHAR,
        code VARCHAR UNIQUE,
        email VARCHAR,
        phone VARCHAR,
        country VARCHAR,
        timezone VARCHAR,
        default_currency_id VARCHAR,
        status VARCHAR NOT NULL DEFAULT 'ACTIVE',
        business_type VARCHAR DEFAULT 'BOTH' CHECK (business_type IN ('PRODUCT', 'SERVICE', 'BOTH')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_type VARCHAR DEFAULT 'BOTH' CHECK (business_type IN ('PRODUCT', 'SERVICE', 'BOTH'));`,

      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password_hash VARCHAR NOT NULL,
        role VARCHAR NOT NULL DEFAULT 'CUSTOMER',
        status VARCHAR NOT NULL DEFAULT 'ACTIVE',
        first_name VARCHAR,
        last_name VARCHAR,
        phone VARCHAR,
        avatar_url VARCHAR,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        code VARCHAR NOT NULL,
        description VARCHAR,
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, code)
      );`,

      `CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module VARCHAR NOT NULL,
        action VARCHAR NOT NULL,
        resource VARCHAR NOT NULL,
        description VARCHAR,
        UNIQUE(module, action, resource)
      );`,

      `CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );`,

      `CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );`,

      `CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        lead_number VARCHAR,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR,
        company_name VARCHAR,
        email VARCHAR,
        phone VARCHAR,
        source VARCHAR,
        campaign VARCHAR,
        industry VARCHAR,
        country VARCHAR,
        city VARCHAR,
        estimated_budget NUMERIC(15,2),
        requirement TEXT,
        priority VARCHAR NOT NULL DEFAULT 'MEDIUM',
        assigned_user_id UUID REFERENCES users(id),
        status VARCHAR NOT NULL DEFAULT 'NEW',
        qualification_status VARCHAR NOT NULL DEFAULT 'UNQUALIFIED',
        lead_score INTEGER DEFAULT 0,
        score_band VARCHAR,
        trial_status VARCHAR,
        trial_started_at TIMESTAMP,
        trial_ends_at TIMESTAMP,
        converted_customer_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, lead_number)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_leads_company_status ON leads(company_id, status);`,
      `CREATE INDEX IF NOT EXISTS idx_leads_company_assigned ON leads(company_id, assigned_user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_leads_company_created ON leads(company_id, created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);`,
      `CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);`,

      `CREATE TABLE IF NOT EXISTS lead_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        interaction_type VARCHAR NOT NULL,
        direction VARCHAR NOT NULL DEFAULT 'OUTBOUND',
        subject VARCHAR,
        notes TEXT,
        outcome VARCHAR,
        next_followup_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        user_id UUID REFERENCES users(id),
        action VARCHAR NOT NULL,
        entity_type VARCHAR NOT NULL,
        entity_id UUID NOT NULL,
        before_state JSONB,
        after_state JSONB,
        reason VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);`,

      `CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        industry VARCHAR,
        website VARCHAR,
        address TEXT,
        status VARCHAR NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);`,

      `CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR,
        email VARCHAR,
        phone VARCHAR,
        job_title VARCHAR,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_contacts_company_customer ON contacts(company_id, customer_id);`,

      `CREATE TABLE IF NOT EXISTS opportunities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        amount NUMERIC(15,2),
        stage VARCHAR NOT NULL DEFAULT 'PROSPECTING',
        probability INTEGER DEFAULT 10,
        expected_close_date DATE,
        assigned_user_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_opportunities_company_customer ON opportunities(company_id, customer_id);`,

      `CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        entity_type VARCHAR NOT NULL,
        entity_id UUID NOT NULL,
        interaction_type VARCHAR NOT NULL,
        notes TEXT,
        outcome VARCHAR,
        next_followup_at TIMESTAMP,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_activities_company_entity ON activities(company_id, entity_type, entity_id);`,

      `CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES product_categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_product_categories_company ON product_categories(company_id);`,

      `CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        sku VARCHAR,
        description TEXT,
        category_id UUID REFERENCES product_categories(id),
        base_price NUMERIC(15,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);`,

      `CREATE TABLE IF NOT EXISTS price_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        currency VARCHAR NOT NULL DEFAULT 'USD',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_price_lists_company ON price_lists(company_id);`,

      `CREATE TABLE IF NOT EXISTS price_list_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        price NUMERIC(15,2) NOT NULL,
        UNIQUE(price_list_id, product_id)
      );`,

      `CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        opportunity_id UUID REFERENCES opportunities(id),
        status VARCHAR NOT NULL DEFAULT 'DRAFT',
        subtotal NUMERIC(15,2) DEFAULT 0,
        discount_total NUMERIC(15,2) DEFAULT 0,
        tax_total NUMERIC(15,2) DEFAULT 0,
        total NUMERIC(15,2) DEFAULT 0,
        valid_until DATE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_quotations_company_customer ON quotations(company_id, customer_id);`,

      `CREATE TABLE IF NOT EXISTS quotation_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC(15,2) NOT NULL,
        discount_percent NUMERIC(5,2) DEFAULT 0,
        line_total NUMERIC(15,2) NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_quotation_lines_quotation ON quotation_lines(quotation_id);`,

      `CREATE TABLE IF NOT EXISTS sales_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        quotation_id UUID REFERENCES quotations(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        status VARCHAR NOT NULL DEFAULT 'DRAFT',
        total NUMERIC(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_sales_orders_company_customer ON sales_orders(company_id, customer_id);`,

      `CREATE TABLE IF NOT EXISTS sales_order_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC(15,2) NOT NULL,
        line_total NUMERIC(15,2) NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_sales_order_lines_order ON sales_order_lines(order_id);`,

      `CREATE TABLE IF NOT EXISTS warehouses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        name VARCHAR NOT NULL,
        location VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity_on_hand INTEGER NOT NULL DEFAULT 0,
        quantity_reserved INTEGER NOT NULL DEFAULT 0,
        UNIQUE(warehouse_id, product_id),
        CHECK (quantity_on_hand >= quantity_reserved)
      );`,

      `CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        product_id UUID NOT NULL REFERENCES products(id),
        warehouse_id UUID NOT NULL REFERENCES warehouses(id),
        movement_type VARCHAR NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_product ON stock_movements(warehouse_id, product_id);`,

      `CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        order_id UUID REFERENCES sales_orders(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        status VARCHAR NOT NULL DEFAULT 'DRAFT',
        subtotal NUMERIC(15,2) DEFAULT 0,
        tax_total NUMERIC(15,2) DEFAULT 0,
        total NUMERIC(15,2) DEFAULT 0,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_company_customer ON invoices(company_id, customer_id);`,

      `CREATE TABLE IF NOT EXISTS invoice_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC(15,2) NOT NULL,
        line_total NUMERIC(15,2) NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);`,

      `CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id),
        amount NUMERIC(15,2) NOT NULL,
        payment_method VARCHAR NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_number VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);`
    ];

    for (let i = 0; i < queries.length; i++) {
      try {
        await pool.query(queries[i]);
      } catch (err) {
        console.error('Failed on query index', i, queries[i]);
        throw err;
      }
    }
    console.log('Migration completed successfully. All tables are ready.');
  } catch (error) {
    console.error('Error running migration:');
    console.error('Message:', error.message);
    console.error('Detail:', error.detail);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
