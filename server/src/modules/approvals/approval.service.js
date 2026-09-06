/**
 * Blended Discount Risk Score Engine
 * 
 * Logic:
 * 1. Each line has a category-specific discount ceiling.
 * 2. Per-line overage = max(0, applied_discount - category_ceiling)
 * 3. Blended score = weighted average of per-line overages (by line value)
 * 4. Score 0      → AUTO_APPROVED
 * 5. Score 1–8    → SALES_MANAGER required
 * 6. Score >8 OR margin <15% → SALES_MANAGER + FINANCE required
 */

const approvalRepository = require('./approval.repository');
const quotationRepository = require('../quotations/quotation.repository');

// Default category discount ceilings (can be overridden by DB config)
const DEFAULT_CATEGORY_CEILINGS = {
  'Hardware':      15,  // percentage
  'Software':      20,
  'Services':      10,
  'Subscriptions': 12,
  'Support':       8,
  'Consulting':    10,
  'DEFAULT':       10,
};

const CUSTOMER_TIER_BONUS = {
  'BRONZE':   0,
  'SILVER':   2,
  'GOLD':     5,
  'PLATINUM': 8,
  'DEFAULT':  0,
};

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * Calculate blended risk score for a set of quotation lines
 * @param {Array} lines - Array of {product_id, quantity, unit_price, discount_percent, line_total, category_name, unit_cost}
 * @param {Object} options - {customerTier, subtotal, totalCost}
 * @returns {Object} risk assessment
 */
const calculateBlendedRiskScore = (lines, options = {}) => {
  const { customerTier = 'DEFAULT' } = options;
  const tierBonus = CUSTOMER_TIER_BONUS[customerTier] || 0;

  let totalLineValue = 0;
  let weightedOverage = 0;
  let maxOverage = 0;
  const violations = [];
  const lineDetails = [];

  for (const line of lines) {
    const category = line.category_name || line.categoryName || 'DEFAULT';
    const baseCeiling = DEFAULT_CATEGORY_CEILINGS[category] || DEFAULT_CATEGORY_CEILINGS['DEFAULT'];
    const effectiveCeiling = baseCeiling + tierBonus;
    const discount = Number(line.discount_percent || line.discountPercentage || 0);
    const lineValue = Number(line.line_total || line.lineTotal || line.unit_price * line.quantity || 0);

    const overage = Math.max(0, discount - effectiveCeiling);
    totalLineValue += lineValue;
    weightedOverage += overage * lineValue;

    if (overage > maxOverage) maxOverage = overage;

    if (overage > 0) {
      violations.push(
        `${line.product_name || line.productName || 'Item'} (${category}): ` +
        `${discount.toFixed(1)}% given, ${effectiveCeiling.toFixed(1)}% allowed — +${overage.toFixed(1)}pts over ceiling`
      );
    }

    lineDetails.push({
      productId: line.product_id || line.productId,
      productName: line.product_name || line.productName,
      category,
      discountApplied: discount,
      categoryceiling: effectiveCeiling,
      overage,
      lineValue,
    });
  }

  const blendedOverage = totalLineValue > 0 ? weightedOverage / totalLineValue : 0;
  
  // Gross margin calculation
  const totalCost = lines.reduce((sum, l) => {
    const qty = Number(l.quantity || 1);
    const cost = Number(l.unit_cost || l.unitCost || l.unit_price * 0.7 || 0);
    return sum + (qty * cost);
  }, 0);
  const netRevenue = totalLineValue;
  const grossMarginPct = netRevenue > 0 ? ((netRevenue - totalCost) / netRevenue) * 100 : 25;

  // Risk score: combination of max overage and blended overage
  const riskScore = Math.round(Math.max(maxOverage, blendedOverage) * 6);
  
  // Determine approval requirements
  let requiresApproval = riskScore > 0 || grossMarginPct < 18;
  let requiresFinance = riskScore > 8 || grossMarginPct < 15;
  let requiredLevel = requiresFinance ? 'DUAL' : (requiresApproval ? 'SALES_MANAGER' : 'NONE');

  const approvalReasons = [...violations];
  if (grossMarginPct < 15) {
    approvalReasons.push(`Gross margin ${grossMarginPct.toFixed(1)}% is below 15% minimum threshold — Finance sign-off required`);
  } else if (grossMarginPct < 18) {
    approvalReasons.push(`Gross margin ${grossMarginPct.toFixed(1)}% is below 18% hurdle rate`);
  }

  return {
    riskScore,
    blendedOverage: parseFloat(blendedOverage.toFixed(2)),
    maxOverage: parseFloat(maxOverage.toFixed(2)),
    grossMarginPercentage: parseFloat(grossMarginPct.toFixed(2)),
    requiresApproval,
    requiresFinance,
    requiredLevel,
    severity: riskScore === 0 ? 'LOW' : riskScore <= 8 ? 'MEDIUM' : 'HIGH',
    violations,
    approvalReasons,
    lineDetails,
    customerTier,
    tierBonus,
  };
};

/**
 * Route a submitted quotation through the approval engine.
 * Creates approval_request record if approval is needed.
 * Updates quotation status accordingly.
 */
const routeQuotationForApproval = async (quotationId, companyId, requestedBy) => {
  const quotation = await quotationRepository.getQuotationByIdAndCompany(quotationId, companyId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'NOT_FOUND');

  if (quotation.status !== 'DRAFT' && quotation.status !== 'SUBMITTED') {
    throw createAppError('Only DRAFT or SUBMITTED quotations can be routed', 422, 'INVALID_STATE');
  }

  const lines = await quotationRepository.getQuotationLines(quotationId, companyId);

  const risk = calculateBlendedRiskScore(lines, {
    customerTier: quotation.customer_tier || 'DEFAULT',
  });

  if (!risk.requiresApproval) {
    // Auto-approve: no policy violation detected
    await quotationRepository.updateQuotationStatus(quotationId, companyId, 'APPROVED');
    return {
      approved: true,
      autoApproved: true,
      risk,
      message: 'Quote auto-approved: all discounts within policy limits.',
    };
  }

  // Check if approval request already exists
  const existingApproval = await approvalRepository.getApprovalByQuotationId(quotationId, companyId);
  
  const approvalData = {
    company_id: companyId,
    quotation_id: quotationId,
    requested_by: requestedBy,
    risk_score: risk.riskScore,
    risk_severity: risk.severity,
    discount_percentage: lines.length > 0
      ? (lines.reduce((s, l) => s + Number(l.discount_percent || 0), 0) / lines.length)
      : 0,
    gross_margin_percentage: risk.grossMarginPercentage,
    total_amount: Number(quotation.total),
    required_level: risk.requiredLevel,
    reasons: risk.approvalReasons,
    blended_risk_details: risk,
  };

  let approvalRequest;
  if (existingApproval && existingApproval.status === 'REJECTED') {
    // Re-create for re-approval
    approvalRequest = await approvalRepository.createApprovalRequest(approvalData);
  } else if (!existingApproval) {
    approvalRequest = await approvalRepository.createApprovalRequest(approvalData);
  } else {
    approvalRequest = existingApproval;
  }

  // Update quotation status
  const newStatus = risk.requiresFinance ? 'APPROVAL_REQUIRED' : 'APPROVAL_REQUIRED';
  await quotationRepository.updateQuotationStatus(quotationId, companyId, newStatus);

  return {
    approved: false,
    autoApproved: false,
    approvalRequest,
    risk,
    message: risk.requiresFinance
      ? 'Dual approval required: Sales Manager + Finance Director.'
      : 'Sales Manager approval required.',
  };
};

const getApprovals = async (companyId, filters) => {
  return approvalRepository.getApprovalsByCompany(companyId, filters);
};

const getApprovalById = async (id, companyId) => {
  const approval = await approvalRepository.getApprovalById(id, companyId);
  if (!approval) throw createAppError('Approval not found', 404, 'NOT_FOUND');
  return approval;
};

const handleApprovalAction = async (id, companyId, action, actorId, actorName, actorRole, comments, reason) => {
  const approval = await approvalRepository.getApprovalById(id, companyId);
  if (!approval) throw createAppError('Approval not found', 404, 'NOT_FOUND');
  if (approval.status !== 'PENDING' && approval.status !== 'ESCALATED') {
    throw createAppError('This approval request is no longer pending', 422, 'INVALID_STATE');
  }

  const auditEntry = {
    action,
    performed_by: actorId,
    performed_by_name: actorName,
    performed_by_role: actorRole,
    comments: comments || null,
    reason: reason || null,
    timestamp: new Date().toISOString(),
  };

  await approvalRepository.addAuditEntry(id, companyId, auditEntry);

  if (action === 'APPROVE') {
    // Check if dual approval is needed and Sales Manager just approved
    const needsDual = approval.required_level === 'DUAL';
    const currentApprovals = (approval.audit_trail || []).filter(e => e.action === 'APPROVE').length;

    if (needsDual && currentApprovals < 1) {
      // First approval done (Sales Manager), now escalate to Finance
      await approvalRepository.updateApprovalStatus(id, companyId, 'ESCALATED');
      await quotationRepository.updateQuotationStatus(approval.quotation_id, companyId, 'APPROVAL_IN_PROGRESS');
      return { ...approval, status: 'ESCALATED', message: 'Forwarded to Finance Director for final sign-off.' };
    } else {
      // Final approval granted
      await approvalRepository.updateApprovalStatus(id, companyId, 'APPROVED');
      await quotationRepository.updateQuotationStatus(approval.quotation_id, companyId, 'APPROVED');
      return { ...approval, status: 'APPROVED', message: 'Quote fully approved and ready for fulfillment.' };
    }
  } else if (action === 'REJECT') {
    if (!reason) throw createAppError('Rejection reason is required', 422, 'VALIDATION_ERROR');
    await approvalRepository.updateApprovalStatus(id, companyId, 'REJECTED');
    await quotationRepository.updateQuotationStatus(approval.quotation_id, companyId, 'REJECTED');
    return { ...approval, status: 'REJECTED' };
  } else if (action === 'REQUEST_CHANGES') {
    await quotationRepository.updateQuotationStatus(approval.quotation_id, companyId, 'TEAM_REVIEW');
    return { ...approval, status: 'PENDING', message: 'Changes requested from sales rep.' };
  }

  throw createAppError('Invalid approval action', 422, 'INVALID_ACTION');
};

module.exports = {
  calculateBlendedRiskScore,
  routeQuotationForApproval,
  getApprovals,
  getApprovalById,
  handleApprovalAction,
};
