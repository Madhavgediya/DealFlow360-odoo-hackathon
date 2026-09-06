require('dotenv').config();
const db = require('../config/database');

const CATALOG_PRODUCTS = [
  {
    sku: 'APX-NB-X1-PRO',
    name: 'UltraBook Pro X1 Carbon (M3 Pro / 32GB / 1TB)',
    description: 'Executive grade 14" OLED powerhouse with enterprise TPM 2.0 security.',
    base_price: 165000,
    cost_price: 128000,
    type: 'PHYSICAL',
    stock: 42,
    unit: 'Units',
    preferred_vendor_id: 'ven-1',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-SRV-HPC-4U',
    name: 'Apex HyperScale Server 4U (Dual Xeon 64C / 512GB ECC)',
    description: 'High performance datacenter virtualization compute blade with redundant hot-swap power.',
    base_price: 780000,
    cost_price: 590000,
    type: 'PHYSICAL',
    stock: 14,
    unit: 'Units',
    preferred_vendor_id: 'ven-2',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-NET-100G-48P',
    name: 'Apex Nexus 100GbE Enterprise Leaf Switch (48-Port QSFP28)',
    description: 'Ultra-low latency spine-leaf network switch with BGP-EVPN support.',
    base_price: 450000,
    cost_price: 340000,
    type: 'PHYSICAL',
    stock: 28,
    unit: 'Units',
    preferred_vendor_id: 'ven-3',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-SEC-FW-10G',
    name: 'Apex Shield Enterprise NextGen Firewall Gateway 10Gbps',
    description: 'Zero-trust SSL inspection, intrusion prevention, and automated malware sandboxing.',
    base_price: 320000,
    cost_price: 230000,
    type: 'PHYSICAL',
    stock: 19,
    unit: 'Units',
    preferred_vendor_id: 'ven-4',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-SAN-NVME-100T',
    name: 'Apex PureFlash NVMe SAN Array 100TB All-Flash',
    description: 'Sub-millisecond latency 100TB raw storage array with active-active synchronous replication.',
    base_price: 1250000,
    cost_price: 940000,
    type: 'PHYSICAL',
    stock: 8,
    unit: 'Units',
    preferred_vendor_id: 'ven-2',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-SAAS-ENT-ANNUAL',
    name: 'DealFlow360 Enterprise Deal OS SaaS License (Annual / 50 Seats)',
    description: 'Complete commercial ERP, automated risk engine, AI Copilot, and customer portal suite.',
    base_price: 360000,
    cost_price: 45000,
    type: 'SUBSCRIPTION',
    stock: 9999,
    unit: 'Subscription',
    preferred_vendor_id: 'ven-1',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-AI-H100-NODE',
    name: 'Apex AI Accelerator Node (8x NVIDIA H100 80GB SXM5 / Liquid Cooled)',
    description: 'Ultimate generative AI training and multi-model inference workstation cluster.',
    base_price: 3200000,
    cost_price: 2750000,
    type: 'PHYSICAL',
    stock: 3,
    unit: 'Units',
    preferred_vendor_id: 'ven-5',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-PWR-UPS-20KVA',
    name: 'Apex PowerGuard 20kVA Online Modular Datacenter UPS',
    description: 'N+1 redundant power conditioner with lithium-ion backup battery module.',
    base_price: 290000,
    cost_price: 220000,
    type: 'PHYSICAL',
    stock: 15,
    unit: 'Units',
    preferred_vendor_id: 'ven-3',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-DBA-TX-1U',
    name: 'Apex Titan Database Appliance (1U / 4TB NVMe RAM Storage)',
    description: 'Hardware-accelerated PostgreSQL & Redis cluster node capable of 2M QPS.',
    base_price: 620000,
    cost_price: 440000,
    type: 'PHYSICAL',
    stock: 11,
    unit: 'Units',
    preferred_vendor_id: 'ven-2',
    service_provider: null,
    service_sla: null,
  },
  {
    sku: 'APX-SLA-PLATINUM',
    name: '24/7 Mission-Critical Enterprise Support & 4hr Onsite SLA (1-Year)',
    description: 'Direct access to level 3 principal infrastructure architects with guaranteed 4hr hardware replacement.',
    base_price: 180000,
    cost_price: 50000,
    type: 'SERVICE',
    stock: 9999,
    unit: 'Yearly Contract',
    preferred_vendor_id: 'ven-1',
    service_provider: 'Tata Consultancy & Infra Services (TCS)',
    service_sla: '4-Hour Guaranteed Onsite Response SLA',
  },
  {
    sku: 'APX-SRV-DEV',
    name: 'Cloud & DevOps Managed Migration Service',
    description: 'Complete architecture migration, containerization, and Kubernetes cluster setup.',
    base_price: 250000,
    cost_price: 80000,
    type: 'SERVICE',
    stock: 500,
    unit: 'Hours/Engagement',
    preferred_vendor_id: 'ven-2',
    service_provider: 'Infosys Cloud Operations',
    service_sla: '24/7 Remote Operations & 1-Hour SLA',
  },
  {
    sku: 'APX-SEC-AUDIT',
    name: 'Enterprise Cybersecurity Audit & Penetration Testing',
    description: 'Full-stack vulnerability assessment, red teaming, and compliance certification.',
    base_price: 420000,
    cost_price: 150000,
    type: 'SERVICE',
    stock: 100,
    unit: 'Audit',
    preferred_vendor_id: 'ven-4',
    service_provider: 'Wipro CyberDefense Unit',
    service_sla: 'Comprehensive ISO 27001 & SOC-2 Audit SLA',
  },
  {
    sku: 'APX-CUST-DEV',
    name: 'Custom ERP & CRM Workflow Integration Service',
    description: 'Bespoke backend adapters, legacy ERP data migration, and automated quotation pipelines.',
    base_price: 350000,
    cost_price: 120000,
    type: 'SERVICE',
    stock: 200,
    unit: 'Engagement',
    preferred_vendor_id: 'ven-3',
    service_provider: 'Apex Professional Services',
    service_sla: 'Dedicated Solutions Architect & Weekly Sprints',
  },
];

async function seedProducts() {
  console.log('Seeding products and service items into PostgreSQL...');

  const compRes = await db.query('SELECT id, name FROM companies ORDER BY created_at ASC');
  if (compRes.rows.length === 0) {
    console.error('No companies found in database');
    process.exit(1);
  }

  const primaryCompanyId = compRes.rows[0].id;
  console.log(`Using primary company: ${compRes.rows[0].name} (${primaryCompanyId})`);

  for (const prod of CATALOG_PRODUCTS) {
    const existing = await db.query('SELECT id FROM products WHERE sku = $1', [prod.sku]);
    if (existing.rows.length > 0) {
      // Update existing
      await db.query(
        `UPDATE products SET
          name = $1, description = $2, base_price = $3, cost_price = $4,
          type = $5, stock = $6, unit = $7, preferred_vendor_id = $8,
          service_provider = $9, service_sla = $10, is_active = true, updated_at = NOW()
        WHERE sku = $11`,
        [
          prod.name,
          prod.description,
          prod.base_price,
          prod.cost_price,
          prod.type,
          prod.stock,
          prod.unit,
          prod.preferred_vendor_id,
          prod.service_provider,
          prod.service_sla,
          prod.sku
        ]
      );
      console.log(`Updated product: ${prod.sku} - ${prod.name}`);
    } else {
      // Insert new
      await db.query(
        `INSERT INTO products (
          company_id, sku, name, description, base_price, cost_price,
          type, stock, unit, preferred_vendor_id, service_provider, service_sla, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)`,
        [
          primaryCompanyId,
          prod.sku,
          prod.name,
          prod.description,
          prod.base_price,
          prod.cost_price,
          prod.type,
          prod.stock,
          prod.unit,
          prod.preferred_vendor_id,
          prod.service_provider,
          prod.service_sla
        ]
      );
      console.log(`Inserted product: ${prod.sku} - ${prod.name}`);
    }
  }

  const total = await db.query('SELECT COUNT(*) as total FROM products');
  console.log(`Successfully finished! Total products in DB: ${total.rows[0].total}`);
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error('Failed to seed products:', err);
  process.exit(1);
});
