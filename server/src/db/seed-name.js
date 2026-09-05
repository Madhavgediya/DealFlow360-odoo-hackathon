require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const COUNT = parseInt(process.env.SEED_COUNT || '1000', 10);
const BATCH_SIZE = 200;

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const choice = (arr) => arr[randInt(0, arr.length - 1)];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = randInt(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const formatDate = (d) => d.toISOString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const firstNames = [
  'Aarav','Vivaan','Aditya','Sai','Arjun','Reyansh','Mohammed','Atharv','Kabir','Anaya','Diya','Saanvi','Pari','Aadhya','Riya','Ira','Aaradhya','Aisha','Vihaan','Krishna','Ishaan','Rudra','Samar','Kian','Aryan','Dhruv','Rohan','Madhav','Neeraj','Priya','Sneha','Nikita','Pooja','Kavya','Harshit','Yash','Aman','Siddharth','James','John','Robert','Michael','David','Sarah','Emily','Jessica','Olivia','Emma','Sophia','Isabella','William','Daniel','Matthew','Andrew','Ryan','Jennifer','Lisa','Priya','Ankit','Rahul','Vikram','Suresh','Meera','Neha','Shreya','Tanya','Karan','Amit','Vijay','Sunita','Deepak','Alok','Raj','Simran','Nisha','Hana','Kenji','Li Wei','Chen','Maria','Carlos','Fernandez','Ahmed','Fatima','Omar','Sophie','Lucas','Mia','Ethan','Chloe'
];
const lastNames = [
  'Shah','Patel','Gediya','Mehta','Sharma','Verma','Gupta','Kumar','Singh','Yadav','Reddy','Nair','Iyer','Desai','Joshi','Malhotra','Kapoor','Rao','Patil','Chopra','Bhatt','Trivedi','Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Gonzalez','Lewis','Lee','Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Philips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Kim','Li','Chen','Singh','Ando','Suzuki','Khan','Ali','Hassan'
];
const companyPrefixes = ['Apex','Blue Horizon','Vertex','Crest','Nova','Pinnacle','Quantum','Synergy','Fusion','Orbit','Aether','Zenith','Nimbus','Vantage','Catalyst','Horizon','Polaris','Infinity','Echo','Stellar','Titan','Astra','Helix','Lumen','Nexus','Stratos','Axion','Beacon','Ember','Driftwood','Ironwood','Redwood','Silverline','Brightpath','Clearwater','Northstar','Westfield','Eastgate','Southbridge','Global','Prime','Elite','Dynamic','Innovex','TechNova','DataCore','CloudPeak','ByteForge','NextGen'];
const companySuffixes = ['Technologies','Solutions','Industries','Enterprises','Systems','Group','Holdings','Labs','Dynamics','Corp','Inc','Ltd','Pvt Ltd','LLP','Partners','Global','International','Ventures','Innovations','Works','Networks','Logistics','Consulting','Services','Analytics','Digital','Software','Manufacturing','Trading','Exports'];
const industries = ['Technology','Finance','Healthcare','Manufacturing','Retail','Energy','Education','Real Estate','Transportation','Agriculture','Telecommunications','Media','Consulting','Hospitality','Construction','Pharmaceuticals','Automotive','Aerospace','Food & Beverage','Mining','Insurance','Legal','Government','Non-Profit','E-commerce','Gaming','Fashion','Sports','Entertainment'];
const countries = [
  { country: 'India', currency: 'INR', timezone: 'Asia/Kolkata', cities: ['Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad','Chennai','Pune','Kolkata','Jaipur','Surat'], phonePrefix: '+91' },
  { country: 'United States', currency: 'USD', timezone: 'America/New_York', cities: ['New York','San Francisco','Austin','Seattle','Chicago','Boston','Los Angeles','Miami','Denver','Atlanta'], phonePrefix: '+1' },
  { country: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London', cities: ['London','Manchester','Birmingham','Edinburgh','Bristol','Leeds','Glasgow','Liverpool','Oxford','Cambridge'], phonePrefix: '+44' },
  { country: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin', cities: ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Düsseldorf','Leipzig','Dresden','Bremen'], phonePrefix: '+49' },
  { country: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo', cities: ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Fukuoka','Kobe','Hiroshima','Sendai'], phonePrefix: '+81' },
  { country: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney', cities: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Canberra','Gold Coast','Newcastle','Darwin','Hobart'], phonePrefix: '+61' },
  { country: 'Canada', currency: 'CAD', timezone: 'America/Toronto', cities: ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Winnipeg','Quebec City','Hamilton','Halifax'], phonePrefix: '+1' },
  { country: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore', cities: ['Singapore'], phonePrefix: '+65' },
  { country: 'UAE', currency: 'AED', timezone: 'Asia/Dubai', cities: ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Al Ain'], phonePrefix: '+971' },
  { country: 'France', currency: 'EUR', timezone: 'Europe/Paris', cities: ['Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Strasbourg','Montpellier','Bordeaux','Lille'], phonePrefix: '+33' },
];
const emailDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','company.com','protonmail.com','icloud.com','aol.com','zoho.com','tech.io'];
const campaignNames = ['Spring Launch 2024','Q1 Cold Outreach','LinkedIn Prospecting','Google Ads - Search','Trade Show Mumbai 2025','Webinar - AI Trends','Referral Program','Email Drip - Nurture','Festival Offer Diwali','Black Friday Blitz','Year End Clearance','Summer Promo 2025','Partner Summit','Direct Mail Q2','Inbound - SEO','Facebook Lead Ads','Influencer Collab','YouTube Pre-roll','Conference Berlin','Roadshow APAC'];
const leadSources = ['Website','Referral','Cold Call','Email Campaign','LinkedIn','Trade Show','Webinar','Partner','Direct Mail','Advertisement','Organic Search','Social Media','Event','Inbound Call','API Import','Chatbot','Marketplace'];
const leadRequirements = [
  'Looking for enterprise CRM with automation and analytics',
  'Need bulk hardware procurement for new branch',
  'Interested in cloud migration and managed services',
  'Requires custom ERP module for inventory',
  'Evaluating vendors for annual maintenance contract',
  'Need quotation for 500 licenses urgently',
  'Exploring AI-powered lead scoring solution',
  'Requirement for warehouse management system with barcode',
  'Looking for HRMS with payroll integration',
  'Need POS integration for 12 retail outlets',
  'Seeking data backup and disaster recovery',
  'Interested in trial for 14 days, then decide',
  'Requires integration with existing SAP',
  'Need help with GST invoicing compliance',
  'Looking for subscription billing platform',
];
const streetNames = ['MG Road','Park Street','Linking Road','Brigade Road','Connaught Place','Bandra Kurla Complex','Juhu Tara Road','Koramangala','Indiranagar','Sector 18','DLF Cyber City','Hitech City','Salt Lake','Banjara Hills','Anna Nagar','FC Road','SB Road','Civil Lines','Rajouri Garden','Andheri East'];
const productCategoryData = [
  { name: 'Software', desc: 'Software licenses and SaaS products' },
  { name: 'Hardware', desc: 'Physical devices and infrastructure' },
  { name: 'Consulting', desc: 'Professional and advisory services' },
  { name: 'Cloud Services', desc: 'IaaS, PaaS and SaaS hosting' },
  { name: 'Networking', desc: 'Routers, switches and accessories' },
  { name: 'Security', desc: 'Cybersecurity and compliance tools' },
  { name: 'Storage', desc: 'NAS, SAN and backup solutions' },
  { name: 'Peripherals', desc: 'Keyboards, displays and accessories' },
  { name: 'Mobile Devices', desc: 'Smartphones, tablets and MDM' },
  { name: 'Industrial', desc: 'Heavy machinery and parts' },
];
const productNames = [
  'Enterprise CRM Suite','Cloud Analytics Pro','HRMS Payroll Module','Inventory Management System','POS Terminal X200','Server Rack 42U','Network Switch 24-Port','Firewall Appliance FX500','Backup Appliance 10TB','Laptop Pro 14" M3','Desktop Workstation Z4','Tablet Elite 10"','Smart Display 55"','WMS Barcode Kit','ERP Finance Module','AI Lead Scoring Engine','Helpdesk Ticketing Platform','Video Conferencing Kit','Time Tracker SaaS','Expense Management App','Custom API Integration','Annual Maintenance Contract','Onboarding & Training Package','Data Migration Service','Cyber Security Audit','Penetration Testing Suite','Mobile Device Management','E-commerce Connector','Payment Gateway Module','GST Invoicing Add-on','Subscription Billing Engine','Warehouse Robotics Controller','IoT Sensor Hub','Edge Computing Node','Database Optimization Pack','UX Audit & Redesign Service'
];
const opportunityNames = ['Enterprise Migration','Branch Expansion','Annual Renewal','New Product Rollout','Infrastructure Upgrade','Q3 Procurement','Q4 Licensing','Digital Transformation','System Integration','Security Overhaul','Cloud Adoption','Hardware Refresh','Software Consolidation','Process Automation','Compliance Upgrade','Market Entry Support','Retail POS Deployment','WMS Implementation','HRMS Rollout','Data Center Setup'];
const activityTypes = ['CALL','EMAIL','MEETING','DEMO','FOLLOW_UP','NOTE','TASK','SITE_VISIT','PROPOSAL_SENT','NEGOTIATION'];
const activityOutcomes = ['SUCCESS','NO_ANSWER','SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED','CONVERTED','NOT_INTERESTED','CALL_BACK_LATER','NEEDS_APPROVAL'];
const stockMovementTypes = ['IN','OUT','ADJUSTMENT','TRANSFER','RESERVATION','RELEASE','DAMAGED','RETURN'];
const paymentMethods = ['CREDIT_CARD','BANK_TRANSFER','CASH','OTHER'];
const leadStatuses = ['NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST','INACTIVE'];
const qualStatuses = ['UNQUALIFIED','WORKING','QUALIFIED','DISQUALIFIED'];
const priorities = ['LOW','MEDIUM','HIGH','URGENT'];
const trialStatuses = ['NOT_STARTED','ACTIVE','EXPIRED','CONVERTED'];
const oppStages = ['PROSPECTING','QUALIFICATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST'];
const quotationStatuses = ['DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED','CANCELLED'];
const orderStatuses = ['DRAFT','CONFIRMED','FULFILLED','CANCELLED'];
const invoiceStatuses = ['DRAFT','ISSUED','PAID','OVERDUE','CANCELLED','PARTIALLY_PAID'];
const customerStatuses = ['ACTIVE','INACTIVE','SUSPENDED'];
const userRolesList = ['ADMIN','SALES_REP','SALES_MANAGER','FINANCE','OPERATIONS','CUSTOMER'];
const userStatuses = ['ACTIVE','INACTIVE'];
const companyStatuses = ['ACTIVE','INACTIVE','SUSPENDED'];
const modules = ['users','billing','leads','opportunities','quotations','orders','inventory','invoices','products','companies','roles','permissions','reports','analytics','settings','customers','contacts','activities','payments','warehouses','price_lists','audit_logs'];
const actions = ['create','read','update','delete','manage','approve','export','import','view','assign'];
const resources = ['*','all','own','team','department','company','public','private','draft','archived'];
const currencies = ['USD','EUR','INR','GBP','JPY','AUD','CAD','SGD','AED','CHF','CNY'];
const priceListNames = ['Standard Price List','Enterprise Price Book','Retail Price Sheet','Wholesale Price Book','VIP Customer Pricing','Region APAC Pricing','Region EMEA Pricing','Region US Pricing','Festival Offer Price List','Clearance Sale Book','Partner Price List','Internal Transfer Pricing','Subscription Annual Plan','Subscription Monthly Plan','Government Tender Pricing'];

// bulk insert helper
async function bulkInsert(client, table, columns, rows) {
  if (!rows.length) return [];
  let insertedCount = 0;
  const returnedIds = [];
  // Process in chunks to avoid too many parameters (PG limit ~65535)
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;
    for (const row of chunk) {
      const ph = row.map(() => `$${idx++}`);
      placeholders.push(`(${ph.join(', ')})`);
      values.push(...row);
    }
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`;
    // For tables where we generated id and want to return, we could add RETURNING id but ON CONFLICT DO NOTHING complicates.
    // Instead we skip returning and rely on generated ids already in rows (first column is id if present)
    await client.query(sql, values);
    insertedCount += chunk.length;
    // collect ids if first column is id (UUID)
    if (columns[0] === 'id') {
      for (const r of chunk) returnedIds.push(r[0]);
    }
    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  -> ${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
  }
  console.log(`✓ ${table}: inserted ${insertedCount} rows`);
  return returnedIds;
}

async function truncateAll(client) {
  console.log('Truncating existing data...');
  const tables = [
    'payments','invoice_lines','invoices',
    'stock_movements','inventory','warehouses',
    'sales_order_lines','sales_orders',
    'quotation_lines','quotations',
    'price_list_items','price_lists',
    'products','product_categories',
    'activities','opportunities',
    'contacts','customers',
    'audit_logs','lead_interactions','leads',
    'user_roles','permissions',
    'roles','users','companies'
  ];
  for (const t of tables) {
    await client.query(`DELETE FROM ${t}`);
  }
  console.log('Truncate complete.');
}

async function seed() {
  const client = await pool.connect();
  const startTime = Date.now();
  console.log(`Starting LARGE seed with COUNT=${COUNT} per table (realistic data)...`);
  console.log(`Database: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@') : 'unknown'}`);

  try {
    await client.query('BEGIN');
    await truncateAll(client);

    // ───────────────────────────────────────────────
    // 1. Companies  (1000)
    // ───────────────────────────────────────────────
    console.log('\n[1/26] Seeding companies...');
    const companies = [];
    const companyIds = [];
    const usedCodes = new Set();
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const prefix = choice(companyPrefixes);
      const suffix = choice(companySuffixes);
      const uniqueNum = 100 + i;
      const name = `${prefix} ${suffix}${i % 7 === 0 ? ' ' + choice(['Global','India','Tech','Systems','Labs']) : ''}`.trim();
      // ensure code unique
      let codeBase = `${prefix.substring(0,4).toUpperCase()}${suffix.substring(0,2).toUpperCase()}${String(uniqueNum).padStart(4,'0')}`;
      let code = codeBase;
      let dup = 1;
      while (usedCodes.has(code)) { code = codeBase + String(dup++); }
      usedCodes.add(code);
      const legal_name = `${name} ${choice(['Private Limited','Inc.','LLP','Corporation','Ltd.'])}`;
      const countryInfo = choice(countries);
      const email = `info@${slug(name).substring(0,15)}${i}.com`;
      const phone = `${countryInfo.phonePrefix} ${randInt(7000000000, 9999999999)}`;
      const status = choice(companyStatuses);
      const created_at = randomDate(new Date(2022, 0, 1), new Date());
      companies.push([id, name, legal_name, code, email, phone, countryInfo.country, countryInfo.timezone, choice(currencies), status, created_at, created_at]);
      companyIds.push({ id, country: countryInfo.country, currency: choice(currencies), timezone: countryInfo.timezone });
    }
    await bulkInsert(client, 'companies', ['id','name','legal_name','code','email','phone','country','timezone','default_currency_id','status','created_at','updated_at'], companies);

    // ───────────────────────────────────────────────
    // 2. Users (1000)
    // ───────────────────────────────────────────────
    console.log('\n[2/26] Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [];
    const userIds = [];
    const usedEmails = new Set();
    // ensure at least one known login per first company
    const knownAdminId = crypto.randomUUID();
    const firstCompanyId = companyIds[0].id;
    users.push([knownAdminId, firstCompanyId, 'Admin User', 'admin@acme.com', passwordHash, 'ADMIN', 'ACTIVE', 'Admin', 'User', '+91 9876543210', null, randomDate(new Date(Date.now() - 30*24*60*60*1000), new Date()), randomDate(new Date(2023,0,1), new Date()), randomDate(new Date(2023,0,1), new Date())]);
    userIds.push({ id: knownAdminId, company_id: firstCompanyId });
    usedEmails.add('admin@acme.com');

    for (let i = 1; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const fn = choice(firstNames);
      const ln = choice(lastNames);
      const fullName = `${fn} ${ln}`;
      const domain = choice(emailDomains);
      let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${domain}`;
      let c = 1;
      while (usedEmails.has(email)) { email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}_${c++}@${domain}`; }
      usedEmails.add(email);
      const role = choice(userRolesList);
      const status = randInt(1,100) > 8 ? 'ACTIVE' : 'INACTIVE';
      const countryInfo = countries.find(c => c.country === comp.country) || choice(countries);
      const phone = `${countryInfo.phonePrefix} ${randInt(7000000000, 9999999999)}`;
      const avatar_url = randInt(1,100) > 70 ? `https://i.pravatar.cc/150?u=${id}` : null;
      const last_login_at = randInt(1,100) > 30 ? randomDate(new Date(Date.now() - 60*24*60*60*1000), new Date()) : null;
      const created_at = randomDate(new Date(2022, 6, 1), new Date());
      users.push([id, comp.id, fullName, email, passwordHash, role, status, fn, ln, phone, avatar_url, last_login_at, created_at, created_at]);
      userIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'users', ['id','company_id','name','email','password_hash','role','status','first_name','last_name','phone','avatar_url','last_login_at','created_at','updated_at'], users);

    // ───────────────────────────────────────────────
    // 3. Roles (1000)
    // ───────────────────────────────────────────────
    console.log('\n[3/26] Seeding roles...');
    const roles = [];
    const roleIds = [];
    const roleCodesPerCompany = new Map(); // company_id -> Set
    const baseRoleNames = ['Sales Representative','Sales Manager','Finance Manager','Operations Lead','Support Agent','HR Manager','Marketing Manager','Admin','Viewer','Editor','Accountant','Inventory Manager','Procurement Officer','Quality Analyst','Business Analyst','Team Lead','Regional Manager','Area Sales Manager','Customer Success','Billing Manager'];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      if (!roleCodesPerCompany.has(comp.id)) roleCodesPerCompany.set(comp.id, new Set());
      const set = roleCodesPerCompany.get(comp.id);
      let code;
      let attempts = 0;
      do {
        const base = choice(baseRoleNames);
        code = `${slug(base).toUpperCase()}_${String(i).padStart(4,'0')}${attempts ? '_' + attempts : ''}`;
        attempts++;
      } while (set.has(code) && attempts < 5);
      set.add(code);
      const name = `${choice(baseRoleNames)} ${i % 10 === 0 ? choice(['I','II','Senior','Junior','Lead']) : ''}`.trim();
      const desc = `Role for ${name} with ${choice(['full','limited','read-only','approval'])} access`;
      const is_system = randInt(1,100) > 85;
      const created_at = randomDate(new Date(2022, 0, 1), new Date());
      roles.push([id, comp.id, name, code, desc, is_system, created_at]);
      roleIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'roles', ['id','company_id','name','code','description','is_system','created_at'], roles);

    // ───────────────────────────────────────────────
    // 4. Permissions (1000)
    // ───────────────────────────────────────────────
    console.log('\n[4/26] Seeding permissions...');
    const permissions = [];
    const permissionIds = [];
    const permSet = new Set();
    let pAttempts = 0;
    while (permissions.length < COUNT && pAttempts < COUNT * 5) {
      pAttempts++;
      const mod = choice(modules);
      const act = choice(actions);
      const res = choice(resources);
      const key = `${mod}|${act}|${res}`;
      if (permSet.has(key)) continue;
      permSet.add(key);
      const id = crypto.randomUUID();
      const desc = `Allows ${act} on ${res} for ${mod} module`;
      permissions.push([id, mod, act, res, desc]);
      permissionIds.push(id);
    }
    // If still less than COUNT due to limited combos, generate synthetic with suffix numbers
    while (permissions.length < COUNT) {
      const id = crypto.randomUUID();
      const mod = `module_${permissions.length}`;
      const act = `action_${permissions.length % 20}`;
      const res = `resource_${permissions.length % 30}`;
      const key = `${mod}|${act}|${res}`;
      if (permSet.has(key)) continue;
      permSet.add(key);
      permissions.push([id, mod, act, res, `Synthetic permission ${permissions.length}`]);
      permissionIds.push(id);
    }
    await bulkInsert(client, 'permissions', ['id','module','action','resource','description'], permissions);

    // ───────────────────────────────────────────────
    // 5. user_roles (1000)
    // ───────────────────────────────────────────────
    console.log('\n[5/26] Seeding user_roles...');
    const userRoles = [];
    const urSet = new Set();
    let urAttempts = 0;
    while (userRoles.length < COUNT && urAttempts < COUNT * 10) {
      urAttempts++;
      const u = choice(userIds);
      // prefer roles from same company 70% time
      let r;
      if (randInt(1,100) <= 70) {
        const sameCompanyRoles = roleIds.filter(x => x.company_id === u.company_id);
        r = sameCompanyRoles.length ? choice(sameCompanyRoles) : choice(roleIds);
      } else {
        r = choice(roleIds);
      }
      const key = `${u.id}|${r.id}`;
      if (urSet.has(key)) continue;
      urSet.add(key);
      userRoles.push([u.id, r.id]);
    }
    await bulkInsert(client, 'user_roles', ['user_id','role_id'], userRoles);

    // ───────────────────────────────────────────────
    // 6. Leads (1000)
    // ───────────────────────────────────────────────
    console.log('\n[6/26] Seeding leads...');
    const leads = [];
    const leadIds = [];
    const leadNumbersSeen = new Set();
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const assignedUser = choice(userIds.filter(u => u.company_id === comp.id) || userIds);
      const fn = choice(firstNames);
      const ln = choice(lastNames);
      const company_name = randInt(1,100) > 30 ? `${choice(companyPrefixes)} ${choice(companySuffixes)}` : null;
      const countryInfo = choice(countries);
      const city = choice(countryInfo.cities);
      // lead_number unique per company
      let lead_number = `LD-${String(i+1).padStart(6,'0')}-${randInt(10,99)}`;
      let lk = `${comp.id}|${lead_number}`;
      let dup2 = 1;
      while (leadNumbersSeen.has(lk)) { lead_number = `LD-${String(i+1).padStart(6,'0')}-${randInt(10,99)}_${dup2++}`; lk = `${comp.id}|${lead_number}`; }
      leadNumbersSeen.add(lk);
      const email = randInt(1,100) > 15 ? `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1,999)}@${choice(emailDomains)}` : null;
      const phone = randInt(1,100) > 20 ? `${countryInfo.phonePrefix} ${randInt(7000000000, 9999999999)}` : null;
      const source = choice(leadSources);
      const campaign = choice(campaignNames);
      const industry = choice(industries);
      const estimated_budget = randInt(1,100) > 25 ? randFloat(5000, 500000, 2) : null;
      const requirement = choice(leadRequirements);
      const priority = choice(priorities);
      const status = choice(leadStatuses);
      const qualification_status = choice(qualStatuses);
      const lead_score = randInt(0,100);
      let score_band = 'COLD';
      if (lead_score >= 75) score_band = 'HOT';
      else if (lead_score >= 50) score_band = 'WARM';
      else if (lead_score >= 25) score_band = 'LUKEWARM';
      const trial_status = choice(trialStatuses);
      const now = new Date();
      let trial_started_at = null, trial_ends_at = null;
      if (trial_status === 'ACTIVE' || trial_status === 'EXPIRED' || trial_status === 'CONVERTED') {
        trial_started_at = randomDate(new Date(now.getTime() - 90*24*60*60*1000), now);
        trial_ends_at = new Date(trial_started_at.getTime() + 14*24*60*60*1000);
      }
      const created_at = randomDate(new Date(2023,0,1), new Date());
      leads.push([id, comp.id, lead_number, fn, ln, company_name, email, phone, source, campaign, industry, countryInfo.country, city, estimated_budget, requirement, priority, assignedUser ? assignedUser.id : null, status, qualification_status, lead_score, score_band, trial_status, trial_started_at, trial_ends_at, null, created_at, created_at]);
      leadIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'leads', ['id','company_id','lead_number','first_name','last_name','company_name','email','phone','source','campaign','industry','country','city','estimated_budget','requirement','priority','assigned_user_id','status','qualification_status','lead_score','score_band','trial_status','trial_started_at','trial_ends_at','converted_customer_id','created_at','updated_at'], leads);

    // ───────────────────────────────────────────────
    // 7. lead_interactions (1000)
    // ───────────────────────────────────────────────
    console.log('\n[7/26] Seeding lead_interactions...');
    const leadInteractions = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const lead = choice(leadIds);
      // pick user from same company as lead if possible
      const eligibleUsers = userIds.filter(u => u.company_id === lead.company_id);
      const user = eligibleUsers.length ? choice(eligibleUsers) : choice(userIds);
      const interaction_type = choice(activityTypes);
      const direction = choice(['INBOUND','OUTBOUND']);
      const subject = `${interaction_type} - ${choice(['Intro Call','Follow-up','Demo Scheduled','Proposal Discussion','Negotiation','Feedback','Onboarding'])} ${i+1}`;
      const notes = `${choice(['Discussed pricing','Sent brochure','Customer asked for discount','Followed up via email','Scheduled next meeting','Shared case studies','Answered queries about integration'])} for lead ${lead.id.substring(0,8)}. ${choice(leadRequirements)}`;
      const outcome = choice(activityOutcomes);
      const next_followup_at = randInt(1,100) > 40 ? randomDate(new Date(), new Date(Date.now() + 30*24*60*60*1000)) : null;
      const created_at = randomDate(new Date(2023,0,1), new Date());
      leadInteractions.push([id, lead.id, user.id, interaction_type, direction, subject, notes, outcome, next_followup_at, created_at]);
    }
    await bulkInsert(client, 'lead_interactions', ['id','lead_id','user_id','interaction_type','direction','subject','notes','outcome','next_followup_at','created_at'], leadInteractions);

    // ───────────────────────────────────────────────
    // 8. audit_logs (1000) - needs company_id, user_id
    // ───────────────────────────────────────────────
    console.log('\n[8/26] Seeding audit_logs...');
    const auditLogs = [];
    const auditActions = ['CREATE','UPDATE','DELETE','LOGIN','VIEW','EXPORT','APPROVE','REJECT','CONVERT','ASSIGN'];
    const entityTypes = ['companies','users','leads','customers','opportunities','quotations','orders','invoices','products','contacts','activities'];
    // collect some entity_ids for realistic reference
    const allEntityIds = [...companyIds.map(c=>c.id), ...userIds.map(u=>u.id), ...leadIds.map(l=>l.id)];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const user = choice(userIds.filter(u=>u.company_id===comp.id) || userIds);
      const action = choice(auditActions);
      const entity_type = choice(entityTypes);
      const entity_id = choice(allEntityIds);
      const before_state = action === 'UPDATE' ? JSON.stringify({ status: choice(['OLD','PENDING']), amount: randFloat(1000,50000,2) }) : null;
      const after_state = JSON.stringify({ status: choice(['NEW','ACTIVE','APPROVED']), amount: randFloat(1000,50000,2), updated_by: user.id });
      const reason = choice([null, 'Routine update','Customer request','System correction','Approval workflow','Data migration']);
      const created_at = randomDate(new Date(2023,0,1), new Date());
      auditLogs.push([id, comp.id, user.id, action, entity_type, entity_id, before_state, after_state, reason, created_at]);
    }
    await bulkInsert(client, 'audit_logs', ['id','company_id','user_id','action','entity_type','entity_id','before_state','after_state','reason','created_at'], auditLogs);

    // ───────────────────────────────────────────────
    // 9. Customers (1000)
    // ───────────────────────────────────────────────
    console.log('\n[9/26] Seeding customers...');
    const customers = [];
    const customerIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const name = `${choice(companyPrefixes)} ${choice(companySuffixes)} ${randInt(1,100) > 80 ? choice(['Solutions','Holdings','Group']) : ''}`.trim() + ` ${String(i+1).padStart(4,'0')}`;
      const industry = choice(industries);
      const slugName = slug(name).substring(0,20);
      const website = randInt(1,100) > 20 ? `https://www.${slugName}.com` : null;
      const countryInfo = choice(countries);
      const city = choice(countryInfo.cities);
      const street = `${randInt(1,999)} ${choice(streetNames)}, ${city}`;
      const address = `${street}, ${countryInfo.country} - ${randInt(100000,999999)}`;
      const status = choice(customerStatuses);
      const created_at = randomDate(new Date(2022,0,1), new Date());
      customers.push([id, comp.id, name, industry, website, address, status, created_at, created_at]);
      customerIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'customers', ['id','company_id','name','industry','website','address','status','created_at','updated_at'], customers);

    // ───────────────────────────────────────────────
    // 10. Contacts (1000)
    // ───────────────────────────────────────────────
    console.log('\n[10/26] Seeding contacts...');
    const contacts = [];
    const contactIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const cust = choice(customerIds);
      const compId = cust.company_id;
      const fn = choice(firstNames);
      const ln = choice(lastNames);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1,999)}@${slug(cust.id).substring(0,5)}-${choice(emailDomains)}`;
      // more realistic: use customer-style domain
      const emailReal = `${fn.toLowerCase()}.${ln.toLowerCase()}@${choice(['gmail.com','outlook.com','company.com'])}`;
      const phone = `${choice(countries).phonePrefix} ${randInt(7000000000,9999999999)}`;
      const job_title = choice(['CEO','CTO','CFO','Operations Manager','Procurement Head','IT Manager','Sales Director','Finance Controller','HR Manager','Project Lead','Business Owner','Founder','VP Engineering','General Manager']);
      const is_primary = i % 10 === 0; // every 10th is primary
      const created_at = randomDate(new Date(2022,6,1), new Date());
      contacts.push([id, compId, cust.id, fn, ln, emailReal, phone, job_title, is_primary, created_at, created_at]);
      contactIds.push({ id, company_id: compId, customer_id: cust.id });
    }
    await bulkInsert(client, 'contacts', ['id','company_id','customer_id','first_name','last_name','email','phone','job_title','is_primary','created_at','updated_at'], contacts);

    // ───────────────────────────────────────────────
    // 11. Opportunities (1000)
    // ───────────────────────────────────────────────
    console.log('\n[11/26] Seeding opportunities...');
    const opportunities = [];
    const opportunityIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const cust = choice(customerIds);
      const compId = cust.company_id;
      const name = `${choice(opportunityNames)} - ${choice(companyPrefixes)} ${String(i+1).padStart(3,'0')}`;
      const amount = randFloat(5000, 500000, 2);
      const stage = choice(oppStages);
      let probability = 10;
      if (stage === 'PROSPECTING') probability = randInt(10,20);
      else if (stage === 'QUALIFICATION') probability = randInt(25,40);
      else if (stage === 'PROPOSAL') probability = randInt(50,65);
      else if (stage === 'NEGOTIATION') probability = randInt(70,85);
      else if (stage === 'CLOSED_WON') probability = 100;
      else if (stage === 'CLOSED_LOST') probability = 0;
      const expected_close_date = randomDate(new Date(Date.now() - 30*24*60*60*1000), new Date(Date.now() + 180*24*60*60*1000));
      const eligibleUsers = userIds.filter(u=>u.company_id===compId);
      const assigned_user_id = eligibleUsers.length && randInt(1,100) > 15 ? choice(eligibleUsers).id : null;
      const created_at = randomDate(new Date(2023,0,1), new Date());
      opportunities.push([id, compId, cust.id, name, amount, stage, probability, expected_close_date.toISOString().split('T')[0], assigned_user_id, created_at, created_at]);
      opportunityIds.push({ id, company_id: compId, customer_id: cust.id });
    }
    await bulkInsert(client, 'opportunities', ['id','company_id','customer_id','name','amount','stage','probability','expected_close_date','assigned_user_id','created_at','updated_at'], opportunities);

    // ───────────────────────────────────────────────
    // 12. Activities (1000)
    // ───────────────────────────────────────────────
    console.log('\n[12/26] Seeding activities...');
    const activities = [];
    // entity_type options
    const activityEntityTypes = ['lead','opportunity','customer','contact'];
    // need mapping to real ids per type per company
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      // pick random entity type and random entity id belonging to that company
      const entity_type = choice(activityEntityTypes);
      let entity_id, company_id;
      if (entity_type === 'lead') { const e = choice(leadIds); entity_id = e.id; company_id = e.company_id; }
      else if (entity_type === 'opportunity') { const e = choice(opportunityIds); entity_id = e.id; company_id = e.company_id; }
      else if (entity_type === 'customer') { const e = choice(customerIds); entity_id = e.id; company_id = e.company_id; }
      else { const e = choice(contactIds); entity_id = e.id; company_id = e.company_id; }
      const interaction_type = choice(activityTypes);
      const notes = `${choice(['Called customer','Sent follow-up email','Had meeting','Demo given','Proposal sent','Negotiated pricing','Closed deal','Shared documents'])} regarding ${entity_type} ${entity_id.substring(0,8)}. Next steps: ${choice(leadRequirements)}`;
      const outcome = choice(activityOutcomes);
      const next_followup_at = randInt(1,100) > 45 ? randomDate(new Date(), new Date(Date.now()+45*24*60*60*1000)) : null;
      const eligibleUsers = userIds.filter(u=>u.company_id===company_id);
      const user_id = eligibleUsers.length ? choice(eligibleUsers).id : choice(userIds).id;
      const created_at = randomDate(new Date(2023,0,1), new Date());
      activities.push([id, company_id, entity_type, entity_id, interaction_type, notes, outcome, next_followup_at, user_id, created_at, created_at]);
    }
    await bulkInsert(client, 'activities', ['id','company_id','entity_type','entity_id','interaction_type','notes','outcome','next_followup_at','user_id','created_at','updated_at'], activities);

    // ───────────────────────────────────────────────
    // 13. Product Categories (1000)
    // ───────────────────────────────────────────────
    console.log('\n[13/26] Seeding product_categories...');
    const productCategories = [];
    const productCategoryIds = [];
    // first create top-level categories per company
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const base = choice(productCategoryData);
      const extra = i % 50 === 0 ? ` - ${choice(['Enterprise','SMB','Retail','Cloud'])}` : '';
      const name = `${base.name}${extra} ${i > productCategoryData.length ? String(i).padStart(3,'0') : ''}`.trim();
      // parent logic: 75% null, 25% choose earlier category with same company
      let parent_id = null;
      if (i > 50 && randInt(1,100) <= 25) {
        const candidates = productCategoryIds.filter(c=>c.company_id===comp.id);
        if (candidates.length) parent_id = choice(candidates).id;
      }
      const description = base.desc + (parent_id ? ' - Subcategory' : '');
      const created_at = randomDate(new Date(2022,0,1), new Date());
      productCategories.push([id, comp.id, name, description, parent_id, created_at, created_at]);
      productCategoryIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'product_categories', ['id','company_id','name','description','parent_id','created_at','updated_at'], productCategories);

    // ───────────────────────────────────────────────
    // 14. Products (1000)
    // ───────────────────────────────────────────────
    console.log('\n[14/26] Seeding products...');
    const products = [];
    const productIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const catCandidates = productCategoryIds.filter(c=>c.company_id===comp.id);
      const category_id = catCandidates.length && randInt(1,100) > 10 ? choice(catCandidates).id : null;
      const baseName = choice(productNames);
      const variant = randInt(1,100) > 60 ? ` ${choice(['Pro','Enterprise','Lite','Standard','Premium','Ultra','Max'])}` : '';
      const version = randInt(1,100) > 70 ? ` v${randInt(1,5)}.${randInt(0,9)}` : '';
      const name = `${baseName}${variant}${version} ${i > productNames.length ? '#'+String(i).padStart(4,'0') : ''}`.trim();
      const sku = `${baseName.substring(0,3).toUpperCase()}-${choice(['HW','SW','CL','SV'])}-${String(1000+i).padStart(5,'0')}`;
      const description = `${name} - ${choice(['High performance','Cost effective','Scalable','Enterprise grade','Cloud native','On-premise','Hybrid'])} solution for ${choice(industries)} industry. ${choice(leadRequirements)}`;
      const base_price = randFloat(99, 50000, 2);
      const is_active = randInt(1,100) > 5;
      const created_at = randomDate(new Date(2022,3,1), new Date());
      products.push([id, comp.id, name, sku, description, category_id, base_price, is_active, created_at, created_at]);
      productIds.push({ id, company_id: comp.id, base_price, category_id });
    }
    await bulkInsert(client, 'products', ['id','company_id','name','sku','description','category_id','base_price','is_active','created_at','updated_at'], products);

    // ───────────────────────────────────────────────
    // 15. Price Lists (1000)
    // ───────────────────────────────────────────────
    console.log('\n[15/26] Seeding price_lists...');
    const priceLists = [];
    const priceListIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const name = `${choice(priceListNames)} ${i > priceListNames.length ? '- ' + String(i).padStart(3,'0') : ''}`.trim() + (randInt(1,100)>80 ? ` ${choice(countries).country}` : '');
      const currency = choice(currencies);
      const is_active = randInt(1,100) > 10;
      const created_at = randomDate(new Date(2023,0,1), new Date());
      priceLists.push([id, comp.id, name, currency, is_active, created_at]);
      priceListIds.push({ id, company_id: comp.id, currency });
    }
    await bulkInsert(client, 'price_lists', ['id','company_id','name','currency','is_active','created_at'], priceLists);

    // ───────────────────────────────────────────────
    // 16. Price List Items (1000) - unique per price_list+product
    // ───────────────────────────────────────────────
    console.log('\n[16/26] Seeding price_list_items...');
    const priceListItems = [];
    const pliSet = new Set();
    let pliAttempts = 0;
    while (priceListItems.length < COUNT && pliAttempts < COUNT * 15) {
      pliAttempts++;
      const pl = choice(priceListIds);
      // need product from same company
      const prodsSameCompany = productIds.filter(p=>p.company_id===pl.company_id);
      if (!prodsSameCompany.length) continue;
      const prod = choice(prodsSameCompany);
      const key = `${pl.id}|${prod.id}`;
      if (pliSet.has(key)) continue;
      pliSet.add(key);
      const id = crypto.randomUUID();
      // price variation: base_price ± 30%
      const price = parseFloat((prod.base_price * randFloat(0.7, 1.4, 2)).toFixed(2));
      priceListItems.push([id, pl.company_id, pl.id, prod.id, price]);
    }
    await bulkInsert(client, 'price_list_items', ['id','company_id','price_list_id','product_id','price'], priceListItems);

    // ───────────────────────────────────────────────
    // 17. Warehouses (1000)
    // ───────────────────────────────────────────────
    console.log('\n[17/26] Seeding warehouses...');
    const warehouses = [];
    const warehouseIds = [];
    const warehouseNames = ['Main Warehouse','Central Depot','North Hub','South Distribution Center','East Storage','West Facility','Cold Storage','Bonded Warehouse','Transit Hub','Overflow Storage','Regional DC','Primary Warehouse','Secondary Warehouse','Automated Fulfillment Center','3PL Partner Warehouse'];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const comp = choice(companyIds);
      const countryInfo = countries.find(c=>c.country===comp.country) || choice(countries);
      const city = choice(countryInfo.cities);
      const name = `${choice(warehouseNames)} - ${city} ${i > warehouseNames.length ? '#'+String(i).padStart(3,'0') : ''}`.trim();
      const location = `${randInt(1,500)} Industrial Area, ${city}, ${countryInfo.country} - ${randInt(100000,999999)}`;
      const is_active = randInt(1,100) > 7;
      const created_at = randomDate(new Date(2022,0,1), new Date());
      warehouses.push([id, comp.id, name, location, is_active, created_at]);
      warehouseIds.push({ id, company_id: comp.id });
    }
    await bulkInsert(client, 'warehouses', ['id','company_id','name','location','is_active','created_at'], warehouses);

    // ───────────────────────────────────────────────
    // 18. Inventory (1000) - unique warehouse+product, check quantity_on_hand >= quantity_reserved
    // ───────────────────────────────────────────────
    console.log('\n[18/26] Seeding inventory...');
    const inventoryRows = [];
    const invSet = new Set();
    let invAttempts = 0;
    while (inventoryRows.length < COUNT && invAttempts < COUNT * 20) {
      invAttempts++;
      const wh = choice(warehouseIds);
      const prodsSameCompany = productIds.filter(p=>p.company_id===wh.company_id);
      if (!prodsSameCompany.length) continue;
      const prod = choice(prodsSameCompany);
      const key = `${wh.id}|${prod.id}`;
      if (invSet.has(key)) continue;
      invSet.add(key);
      const id = crypto.randomUUID();
      const quantity_on_hand = randInt(0, 5000);
      const quantity_reserved = randInt(0, Math.min(quantity_on_hand, randInt(0, Math.floor(quantity_on_hand*0.5))));
      inventoryRows.push([id, wh.company_id, wh.id, prod.id, quantity_on_hand, quantity_reserved]);
    }
    await bulkInsert(client, 'inventory', ['id','company_id','warehouse_id','product_id','quantity_on_hand','quantity_reserved'], inventoryRows);

    // ───────────────────────────────────────────────
    // 19. Quotations (1000)
    // ───────────────────────────────────────────────
    console.log('\n[19/26] Seeding quotations...');
    const quotations = [];
    const quotationIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const cust = choice(customerIds);
      const compId = cust.company_id;
      const oppCandidates = opportunityIds.filter(o=>o.company_id===compId && o.customer_id===cust.id);
      const opportunity_id = oppCandidates.length && randInt(1,100)>40 ? choice(oppCandidates).id : null;
      const eligibleUsers = userIds.filter(u=>u.company_id===compId);
      const created_by = eligibleUsers.length ? choice(eligibleUsers).id : choice(userIds).id;
      const status = choice(quotationStatuses);
      const subtotal = randFloat(1000, 200000, 2);
      const discount_total = randFloat(0, subtotal*0.15, 2);
      const tax_total = parseFloat(((subtotal - discount_total)*0.18).toFixed(2));
      const total = parseFloat((subtotal - discount_total + tax_total).toFixed(2));
      const valid_until = randomDate(new Date(), new Date(Date.now()+90*24*60*60*1000));
      const created_at = randomDate(new Date(2023,0,1), new Date());
      quotations.push([id, compId, cust.id, opportunity_id, status, subtotal, discount_total, tax_total, total, valid_until.toISOString().split('T')[0], created_by, created_at, created_at]);
      quotationIds.push({ id, company_id: compId, customer_id: cust.id });
    }
    await bulkInsert(client, 'quotations', ['id','company_id','customer_id','opportunity_id','status','subtotal','discount_total','tax_total','total','valid_until','created_by','created_at','updated_at'], quotations);

    // ───────────────────────────────────────────────
    // 20. Quotation Lines (1000)
    // ───────────────────────────────────────────────
    console.log('\n[20/26] Seeding quotation_lines...');
    const quotationLines = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const quote = choice(quotationIds);
      const prodsSameCompany = productIds.filter(p=>p.company_id===quote.company_id);
      const prod = prodsSameCompany.length ? choice(prodsSameCompany) : choice(productIds);
      const quantity = randInt(1, 50);
      // try to get realistic price from price_list_items if exists, else base_price
      const basePrice = prod.base_price || randFloat(100,5000,2);
      const unit_price = parseFloat((basePrice * randFloat(0.85,1.25,2)).toFixed(2));
      const discount_percent = randInt(1,100) > 60 ? randFloat(0,25,2) : 0;
      const line_total = parseFloat((quantity * unit_price * (1 - discount_percent/100)).toFixed(2));
      quotationLines.push([id, quote.company_id, quote.id, prod.id, quantity, unit_price, discount_percent, line_total]);
    }
    await bulkInsert(client, 'quotation_lines', ['id','company_id','quotation_id','product_id','quantity','unit_price','discount_percent','line_total'], quotationLines);

    // ───────────────────────────────────────────────
    // 21. Sales Orders (1000)
    // ───────────────────────────────────────────────
    console.log('\n[21/26] Seeding sales_orders...');
    const salesOrders = [];
    const salesOrderIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      // Prefer linking to quotation if possible 60%
      let company_id, customer_id, quotation_id = null;
      if (randInt(1,100) <= 60 && quotationIds.length) {
        const q = choice(quotationIds);
        company_id = q.company_id;
        customer_id = q.customer_id;
        quotation_id = q.id;
      } else {
        const cust = choice(customerIds);
        company_id = cust.company_id;
        customer_id = cust.id;
      }
      const status = choice(orderStatuses);
      const total = randFloat(1000, 300000, 2);
      const created_at = randomDate(new Date(2023,0,1), new Date());
      salesOrders.push([id, company_id, quotation_id, customer_id, status, total, created_at, created_at]);
      salesOrderIds.push({ id, company_id, customer_id });
    }
    await bulkInsert(client, 'sales_orders', ['id','company_id','quotation_id','customer_id','status','total','created_at','updated_at'], salesOrders);

    // ───────────────────────────────────────────────
    // 22. Sales Order Lines (1000)
    // ───────────────────────────────────────────────
    console.log('\n[22/26] Seeding sales_order_lines...');
    const salesOrderLines = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const order = choice(salesOrderIds);
      const prodsSameCompany = productIds.filter(p=>p.company_id===order.company_id);
      const prod = prodsSameCompany.length ? choice(prodsSameCompany) : choice(productIds);
      const quantity = randInt(1,30);
      const unit_price = parseFloat((prod.base_price * randFloat(0.9,1.2,2)).toFixed(2));
      const line_total = parseFloat((quantity * unit_price).toFixed(2));
      salesOrderLines.push([id, order.company_id, order.id, prod.id, quantity, unit_price, line_total]);
    }
    await bulkInsert(client, 'sales_order_lines', ['id','company_id','order_id','product_id','quantity','unit_price','line_total'], salesOrderLines);

    // ───────────────────────────────────────────────
    // 23. Stock Movements (1000)
    // ───────────────────────────────────────────────
    console.log('\n[23/26] Seeding stock_movements...');
    const stockMovements = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      // pick a warehouse and product from same company that exists in inventory if possible
      const wh = choice(warehouseIds);
      const prodsSameCompany = productIds.filter(p=>p.company_id===wh.company_id);
      const prod = prodsSameCompany.length ? choice(prodsSameCompany) : choice(productIds);
      const movement_type = choice(stockMovementTypes);
      let quantity = randInt(1,500);
      if (movement_type === 'OUT' || movement_type === 'RESERVATION') quantity = -Math.abs(quantity); // but schema expects integer not necessarily sign, but we keep positive as quantity is absolute, movement_type indicates direction
      // Actually keep quantity positive per seed example, but allow negative for OUT if needed - keep positive to avoid confusion
      quantity = Math.abs(quantity);
      const reference_type = choice(['sales_order','purchase_order','adjustment','transfer','manual', null]);
      const refId = reference_type ? choice(salesOrderIds).id : null;
      const created_at = randomDate(new Date(2023,0,1), new Date());
      stockMovements.push([id, wh.company_id, prod.id, wh.id, movement_type, quantity, reference_type, refId, created_at]);
    }
    await bulkInsert(client, 'stock_movements', ['id','company_id','product_id','warehouse_id','movement_type','quantity','reference_type','reference_id','created_at'], stockMovements);

    // ───────────────────────────────────────────────
    // 24. Invoices (1000)
    // ───────────────────────────────────────────────
    console.log('\n[24/26] Seeding invoices...');
    const invoices = [];
    const invoiceIds = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const order = choice(salesOrderIds);
      const company_id = order.company_id;
      const customer_id = order.customer_id;
      const status = choice(invoiceStatuses);
      const subtotal = randFloat(1000, 250000, 2);
      const tax_total = parseFloat((subtotal*0.18).toFixed(2));
      const total = parseFloat((subtotal + tax_total).toFixed(2));
      const due_date = randomDate(new Date(), new Date(Date.now()+60*24*60*60*1000));
      const created_at = randomDate(new Date(2023,0,1), new Date());
      invoices.push([id, company_id, order.id, customer_id, status, subtotal, tax_total, total, due_date.toISOString().split('T')[0], created_at, created_at]);
      invoiceIds.push({ id, company_id, customer_id, total });
    }
    await bulkInsert(client, 'invoices', ['id','company_id','order_id','customer_id','status','subtotal','tax_total','total','due_date','created_at','updated_at'], invoices);

    // ───────────────────────────────────────────────
    // 25. Invoice Lines (1000)
    // ───────────────────────────────────────────────
    console.log('\n[25/26] Seeding invoice_lines...');
    const invoiceLines = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const inv = choice(invoiceIds);
      const prodsSameCompany = productIds.filter(p=>p.company_id===inv.company_id);
      const prod = prodsSameCompany.length ? choice(prodsSameCompany) : choice(productIds);
      const quantity = randInt(1,20);
      const unit_price = parseFloat((prod.base_price * randFloat(0.9,1.3,2)).toFixed(2));
      const line_total = parseFloat((quantity * unit_price).toFixed(2));
      invoiceLines.push([id, inv.company_id, inv.id, prod.id, quantity, unit_price, line_total]);
    }
    await bulkInsert(client, 'invoice_lines', ['id','company_id','invoice_id','product_id','quantity','unit_price','line_total'], invoiceLines);

    // ───────────────────────────────────────────────
    // 26. Payments (1000)
    // ───────────────────────────────────────────────
    console.log('\n[26/26] Seeding payments...');
    const payments = [];
    for (let i = 0; i < COUNT; i++) {
      const id = crypto.randomUUID();
      const inv = choice(invoiceIds);
      const amount = parseFloat((randFloat(0.1, 1, 2) * inv.total).toFixed(2)); // partial or full
      const safeAmount = Math.min(amount, inv.total);
      const payment_method = choice(paymentMethods);
      const payment_date = randomDate(new Date(2023,0,1), new Date());
      const reference_number = `${choice(['TXN','PAY','REF','UPI'])}${String(randInt(10000000, 99999999))}${String(i).padStart(4,'0')}`;
      const created_at = payment_date;
      payments.push([id, inv.company_id, inv.id, inv.customer_id, parseFloat(safeAmount.toFixed(2)), payment_method, payment_date, reference_number, created_at]);
    }
    await bulkInsert(client, 'payments', ['id','company_id','invoice_id','customer_id','amount','payment_method','payment_date','reference_number','created_at'], payments);

    // ───────────────────────────────────────────────
    // Fix leads converted_customer_id: set 15% leads as converted to a customer from same company
    // ───────────────────────────────────────────────
    console.log('\nUpdating leads converted_customer_id for converted leads...');
    const convertedLeads = leadIds.filter(() => randInt(1,100) <= 15).slice(0, 150);
    for (const lead of convertedLeads) {
      const custSameCompany = customerIds.filter(c=>c.company_id===lead.company_id);
      if (custSameCompany.length) {
        const cust = choice(custSameCompany);
        await client.query(`UPDATE leads SET converted_customer_id = $1, status='WON', qualification_status='QUALIFIED' WHERE id = $2`, [cust.id, lead.id]);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Large seed completed successfully!');
    console.log(`Seeded ${COUNT} rows per table across 26 tables (~${COUNT*26} total rows)`);

    // Verify counts
    console.log('\nVerifying row counts:');
    const tablesToCheck = ['companies','users','roles','permissions','user_roles','leads','lead_interactions','audit_logs','customers','contacts','opportunities','activities','product_categories','products','price_lists','price_list_items','warehouses','inventory','quotations','quotation_lines','sales_orders','sales_order_lines','stock_movements','invoices','invoice_lines','payments'];
    for (const tbl of tablesToCheck) {
      const res = await client.query(`SELECT COUNT(*)::int as cnt FROM ${tbl}`);
      console.log(`  ${tbl.padEnd(22)} : ${res.rows[0].cnt}`);
    }

    const elapsed = ((Date.now() - startTime)/1000).toFixed(1);
    console.log(`\nDone in ${elapsed}s`);
    console.log('--------------------------------------------------');
    console.log('Sample logins (password: password123):');
    console.log('  admin@acme.com / password123 (ADMIN)');
    console.log('  Any generated user email / password123');
    console.log('--------------------------------------------------');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:');
    console.error('Message:', err.message);
    console.error('Detail:', err.detail);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Allow running with: node src/db/seed-name.js  or  SEED_COUNT=2000 node src/db/seed-name.js
if (require.main === module) {
  seed();
}

module.exports = seed;
