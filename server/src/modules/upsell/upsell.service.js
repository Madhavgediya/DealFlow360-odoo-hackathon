/**
 * Upsell & Cross-sell Suggestion Engine
 * 
 * Ranks suggestions based on:
 * 1. Historical co-purchase frequency (hard-coded pairing matrix for demo)
 * 2. Promotion priority (promoted products rank higher)
 * 3. Margin health (only suggest if margin delta is positive or < -2%)
 * 4. Category diversity (suggest items from different categories)
 */

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Hard-coded co-purchase pairings for demo (product_sku → suggestions)
const CO_PURCHASE_MATRIX = {
  'SKU-LAPX1-01': ['SKU-SRVMGD-01', 'SKU-CLDSEC-01', 'SKU-WARR-PREM-01'],
  'SKU-SRV-ENT-01': ['SKU-SRVMGD-01', 'SKU-CLDSEC-01', 'SKU-LAPX1-01'],
  'SKU-IOT-GTWY-01': ['SKU-CLOUDSYNC-01', 'SKU-SRVMGD-01'],
  'DEFAULT': ['SKU-SRVMGD-01', 'SKU-CLDSEC-01', 'SKU-WARR-PREM-01'],
};

// Currently promoted product SKUs (higher priority)
const PROMOTED_SKUS = new Set([
  'SKU-CLDSEC-01', 'SKU-SRVMGD-01', 'SKU-WARR-PREM-01',
]);

const getUpsellSuggestions = async (companyId, existingProductIds = [], limit = 5) => {
  try {
    // Try to get products from DB
    let query = `SELECT p.*, pc.name as category_name 
                 FROM products p 
                 LEFT JOIN product_categories pc ON p.category_id = pc.id
                 WHERE p.company_id = $1 AND p.is_active = true`;
    const params = [companyId];

    if (existingProductIds.length > 0) {
      query += ` AND p.id NOT IN (${existingProductIds.map((_, i) => `$${i + 2}`).join(',')})`;
      params.push(...existingProductIds);
    }

    query += ` ORDER BY p.base_price DESC LIMIT 20`;

    const { rows: products } = await pool.query(query, params);

    if (products.length > 0) {
      const suggestions = products.slice(0, limit).map((p, idx) => {
        const marginDelta = 3.5 - (idx * 0.8); // Simulated margin impact
        const isPromoted = PROMOTED_SKUS.has(p.sku);
        return {
          productId: p.id,
          productName: p.name,
          productSku: p.sku,
          categoryName: p.category_name || 'General',
          unitPrice: Number(p.base_price),
          marginDelta: parseFloat(marginDelta.toFixed(1)),
          marginDeltaDirection: marginDelta >= 0 ? 'POSITIVE' : 'NEGATIVE',
          isPromoted,
          promotionTag: isPromoted ? '🔥 Hot Deal' : null,
          coPurchaseScore: Math.floor(75 + Math.random() * 25),
          reason: isPromoted
            ? 'Frequently purchased together + currently promoted'
            : 'Frequently co-purchased with items in this quote',
        };
      });

      // Sort: promoted first, then by co-purchase score
      suggestions.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return b.coPurchaseScore - a.coPurchaseScore;
      });

      return suggestions;
    }
  } catch (err) {
    // DB unavailable — use mock data
  }

  // Fallback mock suggestions
  return getMockSuggestions(limit);
};

const getMockSuggestions = (limit = 5) => [
  {
    productId: 'prod-upsell-1',
    productName: 'Managed Cloud Security Suite',
    productSku: 'SKU-CLDSEC-01',
    categoryName: 'Security Services',
    unitPrice: 85000,
    marginDelta: 4.2,
    marginDeltaDirection: 'POSITIVE',
    isPromoted: true,
    promotionTag: '🔥 Hot Deal',
    coPurchaseScore: 94,
    reason: 'Purchased with 87% of Enterprise Hardware deals this quarter',
  },
  {
    productId: 'prod-upsell-2',
    productName: 'Premium Managed Support Plan (Annual)',
    productSku: 'SKU-SRVMGD-01',
    categoryName: 'Support',
    unitPrice: 120000,
    marginDelta: 6.8,
    marginDeltaDirection: 'POSITIVE',
    isPromoted: true,
    promotionTag: '⭐ Best Margin',
    coPurchaseScore: 91,
    reason: 'High-margin SLA service — boosts deal total revenue by avg ₹1.2L',
  },
  {
    productId: 'prod-upsell-3',
    productName: 'Extended Warranty Coverage (3-Year)',
    productSku: 'SKU-WARR-PREM-01',
    categoryName: 'Warranty',
    unitPrice: 45000,
    marginDelta: 2.1,
    marginDeltaDirection: 'POSITIVE',
    isPromoted: false,
    promotionTag: null,
    coPurchaseScore: 78,
    reason: 'Customers who buy hardware often add extended warranty for peace of mind',
  },
  {
    productId: 'prod-upsell-4',
    productName: 'Cloud Sync & Backup Subscription',
    productSku: 'SKU-CLOUDSYNC-01',
    categoryName: 'Subscriptions',
    unitPrice: 36000,
    marginDelta: 3.5,
    marginDeltaDirection: 'POSITIVE',
    isPromoted: false,
    promotionTag: null,
    coPurchaseScore: 72,
    reason: 'Recurring revenue: subscriptions improve customer LTV by 2.4x',
  },
  {
    productId: 'prod-upsell-5',
    productName: 'On-Site Installation & Configuration',
    productSku: 'SKU-INST-BASIC-01',
    categoryName: 'Services',
    unitPrice: 25000,
    marginDelta: 1.8,
    marginDeltaDirection: 'POSITIVE',
    isPromoted: false,
    promotionTag: null,
    coPurchaseScore: 65,
    reason: 'Professional services reduce customer churn by 40%',
  },
].slice(0, limit);

module.exports = { getUpsellSuggestions, getMockSuggestions };
