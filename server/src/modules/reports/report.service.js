const reportRepository = require('./report.repository');

const getDashboardMetrics = async (companyId) => {
  const [funnel, forecast, winRate, financial] = await Promise.all([
    reportRepository.getSalesFunnel(companyId),
    reportRepository.getRevenueForecast(companyId),
    reportRepository.getWinRate(companyId),
    reportRepository.getFinancialSummary(companyId)
  ]);

  // Transform win rate
  const total = Number(winRate.total_closed) || 0;
  const won = Number(winRate.won) || 0;
  const rate = total > 0 ? (won / total) * 100 : 0;

  return {
    sales_funnel: funnel,
    revenue_forecast: forecast,
    win_rate: {
      won,
      lost: Number(winRate.lost) || 0,
      total_closed: total,
      rate_percentage: rate.toFixed(2)
    },
    financial_summary: {
      total_invoices: Number(financial.total_invoices) || 0,
      collected_revenue: Number(financial.collected_revenue) || 0,
      outstanding_revenue: Number(financial.outstanding_revenue) || 0,
      overdue_revenue: Number(financial.overdue_revenue) || 0
    }
  };
};

module.exports = {
  getDashboardMetrics
};
