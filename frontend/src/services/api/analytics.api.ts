import { apiClient, delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { DashboardMetrics, NeedsAttentionItem } from '../../types/analytics';

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<ApiResponse<{ metrics: DashboardMetrics; needsAttention: NeedsAttentionItem[]; serverReport?: any }>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/reports/dashboard');
      if (response.data && response.data.success && response.data.data) {
        const report = response.data.data;
        const mockFallback = mockDb.getDashboardMetrics();
        
        const totalPipeline = report.sales_funnel?.reduce((sum: number, item: any) => sum + Number(item.total_value || 0), 0) || mockFallback.metrics.totalPipelineValue;
        const wonCount = Number(report.win_rate?.won) || 0;
        const totalClosed = Number(report.win_rate?.total_closed) || 0;
        const activeDeals = (report.sales_funnel?.reduce((sum: number, item: any) => sum + Number(item.count || 0), 0)) || mockFallback.metrics.activeDealsCount;

        const metrics: DashboardMetrics = {
          totalPipelineValue: totalPipeline > 0 ? totalPipeline : mockFallback.metrics.totalPipelineValue,
          pipelineChangePercentage: mockFallback.metrics.pipelineChangePercentage,
          activeDealsCount: activeDeals > 0 ? activeDeals : mockFallback.metrics.activeDealsCount,
          quotesAwaitingApprovalCount: mockFallback.metrics.quotesAwaitingApprovalCount,
          activeNegotiationsCount: mockFallback.metrics.activeNegotiationsCount,
          expectedMonthlyRevenue: report.financial_summary?.outstanding_revenue || mockFallback.metrics.expectedMonthlyRevenue,
          averageGrossMarginPercentage: mockFallback.metrics.averageGrossMarginPercentage,
          atRiskDealsCount: mockFallback.metrics.atRiskDealsCount,
          pendingFulfillmentCount: mockFallback.metrics.pendingFulfillmentCount,
        };

        return formatSuccessResponse({
          metrics,
          needsAttention: mockFallback.needsAttention,
          serverReport: report,
        });
      }
    } catch (err) {
      console.debug('Live reports/dashboard note, using calculated store:', err);
    }

    await delay(150);
    return formatSuccessResponse(mockDb.getDashboardMetrics());
  },
};
