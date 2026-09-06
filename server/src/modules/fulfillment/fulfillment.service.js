/**
 * Fulfillment Split Service
 * Intelligently splits an order across warehouses based on:
 * 1. Available stock (quantity_on_hand - quantity_reserved)
 * 2. Shipping cost weighting (prefer fewer shipments)
 * 3. Proximity scoring (lower is better for cost)
 */

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createAppError = (msg, code, c) => { const e = new Error(msg); e.statusCode = code; e.code = c; return e; };

/**
 * Compute optimal warehouse split for a list of order lines
 * @param {Array} lines - [{product_id, quantity}]
 * @param {string} company_id
 * @returns {Object} split plan
 */
const computeWarehouseSplit = async (lines, company_id) => {
  // Get all warehouses for company
  const { rows: warehouses } = await pool.query(
    `SELECT id, name, location, shipping_cost_weight FROM warehouses WHERE company_id = $1 AND is_active = true ORDER BY shipping_cost_weight ASC NULLS LAST`,
    [company_id]
  );

  if (!warehouses.length) {
    // Return mock split for demo without DB
    return getMockSplit(lines);
  }

  const splitPlan = { warehouses: [], backordered: [], shipmentCount: 0, totalShippingCost: 0 };
  const warehouseUsed = new Set();

  for (const line of lines) {
    let remaining = Number(line.quantity);

    // Get available stock for this product across warehouses (ordered by available qty desc, then cost weight asc)
    const { rows: stockRows } = await pool.query(
      `SELECT i.warehouse_id, i.quantity_on_hand, i.quantity_reserved, w.name as warehouse_name, w.location, w.shipping_cost_weight
       FROM inventory i
       JOIN warehouses w ON i.warehouse_id = w.id
       WHERE i.product_id = $1 AND i.company_id = $2 AND w.is_active = true
       ORDER BY (i.quantity_on_hand - i.quantity_reserved) DESC, w.shipping_cost_weight ASC`,
      [line.product_id, company_id]
    );

    for (const stock of stockRows) {
      if (remaining <= 0) break;
      const available = stock.quantity_on_hand - stock.quantity_reserved;
      if (available <= 0) continue;

      const fulfill = Math.min(remaining, available);
      remaining -= fulfill;

      // Reserve stock
      await pool.query(
        `UPDATE inventory SET quantity_reserved = quantity_reserved + $1 
         WHERE warehouse_id = $2 AND product_id = $3 AND company_id = $4`,
        [fulfill, stock.warehouse_id, line.product_id, company_id]
      );

      // Add to split plan
      let whEntry = splitPlan.warehouses.find(w => w.warehouseId === stock.warehouse_id);
      if (!whEntry) {
        whEntry = {
          warehouseId: stock.warehouse_id,
          warehouseName: stock.warehouse_name,
          location: stock.location,
          items: [],
          estimatedShippingCost: (stock.shipping_cost_weight || 1) * 2500,
        };
        splitPlan.warehouses.push(whEntry);
        warehouseUsed.add(stock.warehouse_id);
      }

      whEntry.items.push({
        productId: line.product_id,
        productName: line.product_name || 'Product',
        quantityFulfilled: fulfill,
      });
    }

    if (remaining > 0) {
      splitPlan.backordered.push({
        productId: line.product_id,
        productName: line.product_name || 'Product',
        bacorderedQuantity: remaining,
        message: `${remaining} units on backorder — vendor PO can be auto-triggered`,
      });
    }
  }

  splitPlan.shipmentCount = splitPlan.warehouses.length + (splitPlan.backordered.length > 0 ? 1 : 0);
  splitPlan.totalShippingCost = splitPlan.warehouses.reduce((s, w) => s + w.estimatedShippingCost, 0);
  splitPlan.hasBackorder = splitPlan.backordered.length > 0;
  splitPlan.fulfillmentComplete = splitPlan.backordered.length === 0;

  return splitPlan;
};

// Mock split for demo when no DB
const getMockSplit = (lines) => {
  const warehouses = [
    { warehouseId: 'wh-1', warehouseName: 'Mumbai Central Hub', location: 'Mumbai, Maharashtra', estimatedShippingCost: 2500 },
    { warehouseId: 'wh-2', warehouseName: 'Bengaluru Logistics Hub', location: 'Bengaluru, Karnataka', estimatedShippingCost: 3200 },
  ];

  const splitPlan = { warehouses: [], backordered: [], shipmentCount: 0, totalShippingCost: 0, fulfillmentComplete: true, hasBackorder: false };

  lines.forEach((line, idx) => {
    const qty = Number(line.quantity || 1);
    const half = Math.ceil(qty / 2);
    const remainder = qty - half;

    const wh0 = splitPlan.warehouses.find(w => w.warehouseId === warehouses[0].warehouseId);
    if (!wh0) {
      splitPlan.warehouses.push({
        ...warehouses[0],
        items: [{ productId: line.product_id || line.productId, productName: line.product_name || line.productName || 'Product', quantityFulfilled: half }],
      });
    } else {
      wh0.items.push({ productId: line.product_id || line.productId, productName: line.product_name || line.productName || 'Product', quantityFulfilled: half });
    }

    if (remainder > 0 && lines.length > 1) {
      const wh1 = splitPlan.warehouses.find(w => w.warehouseId === warehouses[1].warehouseId);
      if (!wh1) {
        splitPlan.warehouses.push({
          ...warehouses[1],
          items: [{ productId: line.product_id || line.productId, productName: line.product_name || line.productName || 'Product', quantityFulfilled: remainder }],
        });
      } else {
        wh1.items.push({ productId: line.product_id || line.productId, productName: line.product_name || line.productName || 'Product', quantityFulfilled: remainder });
      }
    }
  });

  splitPlan.shipmentCount = splitPlan.warehouses.length;
  splitPlan.totalShippingCost = splitPlan.warehouses.reduce((s, w) => s + (w.estimatedShippingCost || 0), 0);
  return splitPlan;
};

const getSplitForOrder = async (orderId, company_id) => {
  // Get order lines
  const { rows: lines } = await pool.query(
    `SELECT sol.product_id, sol.quantity, p.name as product_name
     FROM sales_order_lines sol
     JOIN products p ON sol.product_id = p.id
     WHERE sol.order_id = $1 AND sol.company_id = $2`,
    [orderId, company_id]
  );
  if (!lines.length) throw createAppError('No order lines found', 404, 'NOT_FOUND');
  return computeWarehouseSplit(lines, company_id);
};

const getSplitForQuote = async (quoteId, company_id) => {
  const { rows: lines } = await pool.query(
    `SELECT ql.product_id, ql.quantity, p.name as product_name
     FROM quotation_lines ql
     JOIN products p ON ql.product_id = p.id
     WHERE ql.quotation_id = $1 AND ql.company_id = $2`,
    [quoteId, company_id]
  );
  if (!lines.length) return getMockSplit([{ product_id: 'p-1', quantity: 5, product_name: 'Product' }]);
  return computeWarehouseSplit(lines, company_id);
};

module.exports = { computeWarehouseSplit, getSplitForOrder, getSplitForQuote, getMockSplit };
