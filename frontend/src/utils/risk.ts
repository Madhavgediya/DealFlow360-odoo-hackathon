import { QuoteLineItem, QuoteRiskAssessment, RiskFactor, RiskSeverity } from '../types/quote';

export function calculateRiskAssessment(
  lines: QuoteLineItem[],
  subtotal: number,
  discountAmount: number,
  totalCost: number,
  grossMarginPercentage: number
): QuoteRiskAssessment {
  const factors: RiskFactor[] = [];
  const approvalReasons: string[] = [];

  const overallDiscountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;

  // 1. Discount Risk Check per line and overall
  let maxExcessDiscount = 0;
  let categoryWithHighestDiscount = '';
  let lineWithExcess = false;

  for (const line of lines) {
    // Default allowed category limit is 10% if not specified
    const allowedLimit = 10;
    if (line.discountPercentage > allowedLimit) {
      lineWithExcess = true;
      const excess = line.discountPercentage - allowedLimit;
      if (excess > maxExcessDiscount) {
        maxExcessDiscount = excess;
        categoryWithHighestDiscount = line.categoryName || 'General';
      }
    }
  }

  let discountSeverity: RiskSeverity = 'LOW';
  let discountScore = 10;

  if (overallDiscountPercentage > 20 || maxExcessDiscount > 10) {
    discountSeverity = 'CRITICAL';
    discountScore = 95;
    factors.push({
      category: 'DISCOUNT',
      name: 'Category Discount Limit Breach',
      severity: 'CRITICAL',
      score: 95,
      rule: 'Discount > 20% or exceeds Category Limit by >10%',
      actualValue: `${overallDiscountPercentage.toFixed(1)}%`,
      allowedValue: '10.0%',
      difference: `+${(overallDiscountPercentage - 10).toFixed(1)}%`,
      impact: 'Severe erosion of deal baseline profitability',
      explanation: `Requested discount exceeds the standard category ceiling (${categoryWithHighestDiscount}) requiring executive approval.`,
    });
    approvalReasons.push(`Discount of ${overallDiscountPercentage.toFixed(1)}% exceeds standard 10% policy limit.`);
  } else if (overallDiscountPercentage > 12 || maxExcessDiscount > 2) {
    discountSeverity = 'HIGH';
    discountScore = 75;
    factors.push({
      category: 'DISCOUNT',
      name: 'Category Discount Warning',
      severity: 'HIGH',
      score: 75,
      rule: 'Discount exceeds Category standard allowance',
      actualValue: `${overallDiscountPercentage.toFixed(1)}%`,
      allowedValue: '10.0%',
      difference: `+${(overallDiscountPercentage - 10).toFixed(1)}%`,
      impact: 'Reduces net contribution margin',
      explanation: `Discount exceeds 10% allowance. Sales Manager sign-off required.`,
    });
    approvalReasons.push(`Discount exceeds category limit by ${(overallDiscountPercentage - 10).toFixed(1)}%.`);
  } else if (overallDiscountPercentage > 7) {
    discountSeverity = 'MEDIUM';
    discountScore = 40;
    factors.push({
      category: 'DISCOUNT',
      name: 'Moderate Discount Applied',
      severity: 'MEDIUM',
      score: 40,
      rule: 'Standard Discount Threshold',
      actualValue: `${overallDiscountPercentage.toFixed(1)}%`,
      allowedValue: '10.0%',
      difference: `${(10 - overallDiscountPercentage).toFixed(1)}% buffer remaining`,
      impact: 'Normal commercial concession',
      explanation: 'Discount is within rep discretionary authority.',
    });
  }

  // 2. Margin Risk Check (Target: >= 20% minimum gross margin)
  let marginSeverity: RiskSeverity = 'LOW';
  let marginScore = 15;
  const MIN_MARGIN_REQUIRED = 18.0;

  if (grossMarginPercentage < 10) {
    marginSeverity = 'CRITICAL';
    marginScore = 95;
    factors.push({
      category: 'MARGIN',
      name: 'Unacceptable Margin Floor',
      severity: 'CRITICAL',
      score: 95,
      rule: 'Gross Margin >= 18.0%',
      actualValue: `${grossMarginPercentage.toFixed(1)}%`,
      allowedValue: '18.0%',
      difference: `-${(MIN_MARGIN_REQUIRED - grossMarginPercentage).toFixed(1)}%`,
      impact: 'Deal is operating near or below corporate hurdle rate',
      explanation: `Gross margin of ${grossMarginPercentage.toFixed(1)}% is critically below the 18% corporate hurdle rate. Finance Director sign-off mandatory.`,
    });
    approvalReasons.push(`Gross Margin of ${grossMarginPercentage.toFixed(1)}% is below 18% hurdle rate.`);
  } else if (grossMarginPercentage < MIN_MARGIN_REQUIRED) {
    marginSeverity = 'HIGH';
    marginScore = 70;
    factors.push({
      category: 'MARGIN',
      name: 'Margin Below Standard Target',
      severity: 'HIGH',
      score: 70,
      rule: 'Gross Margin >= 18.0%',
      actualValue: `${grossMarginPercentage.toFixed(1)}%`,
      allowedValue: '18.0%',
      difference: `-${(MIN_MARGIN_REQUIRED - grossMarginPercentage).toFixed(1)}%`,
      impact: 'Deal profitability is compressed',
      explanation: `Gross margin is below standard 18% target. Requires managerial review.`,
    });
    approvalReasons.push(`Margin compression to ${grossMarginPercentage.toFixed(1)}%.`);
  } else if (grossMarginPercentage < 25) {
    marginSeverity = 'MEDIUM';
    marginScore = 35;
  }

  // 3. Fulfillment & Stock Risk
  let fulfillmentSeverity: RiskSeverity = 'LOW';
  let fulfillmentScore = 10;
  let totalShortage = 0;

  for (const line of lines) {
    const shortage = line.stockShortage || 0;
    if (shortage > 0) {
      totalShortage += shortage;
    }
  }

  if (totalShortage > 20) {
    fulfillmentSeverity = 'HIGH';
    fulfillmentScore = 75;
    factors.push({
      category: 'FULFILLMENT',
      name: 'Severe Inventory Shortage',
      severity: 'HIGH',
      score: 75,
      rule: 'Available Stock >= Line Quantity',
      actualValue: `${totalShortage} units missing`,
      allowedValue: '0 shortage',
      difference: `${totalShortage} units deficit`,
      impact: 'Requires third-party vendor procurement or multi-warehouse transfer',
      explanation: 'Stock is currently unavailable in primary warehouses. Backorder PO needed.',
    });
  } else if (totalShortage > 0) {
    fulfillmentSeverity = 'MEDIUM';
    fulfillmentScore = 45;
    factors.push({
      category: 'FULFILLMENT',
      name: 'Partial Stock Shortage',
      severity: 'MEDIUM',
      score: 45,
      rule: 'Stock Check',
      actualValue: `${totalShortage} units missing`,
      allowedValue: '0 shortage',
      difference: `${totalShortage} units shortage`,
      impact: 'Secondary warehouse or rapid vendor PO required',
      explanation: 'Minor inventory split required to fulfill order completely.',
    });
  }

  // 4. Overall Aggregate Calculation
  const overallScore = Math.min(
    100,
    Math.round(discountScore * 0.4 + marginScore * 0.4 + fulfillmentScore * 0.2)
  );

  let overallSeverity: RiskSeverity = 'LOW';
  if (overallScore >= 75) overallSeverity = 'CRITICAL';
  else if (overallScore >= 50) overallSeverity = 'HIGH';
  else if (overallScore >= 30) overallSeverity = 'MEDIUM';

  const requiresApproval = approvalReasons.length > 0 || overallSeverity === 'HIGH' || overallSeverity === 'CRITICAL';

  return {
    overallScore,
    overallSeverity,
    discountRisk: discountSeverity,
    marginRisk: marginSeverity,
    fulfillmentRisk: fulfillmentSeverity,
    vendorRisk: 'LOW',
    negotiationRisk: 'LOW',
    factors,
    requiresApproval,
    approvalReasons,
    calculatedAt: new Date().toISOString(),
  };
}
