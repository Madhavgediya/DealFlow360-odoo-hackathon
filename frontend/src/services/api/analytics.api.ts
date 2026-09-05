import { apiClient } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { DashboardMetrics, NeedsAttentionItem } from '../../types/analytics';

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<ApiResponse<{ metrics: DashboardMetrics; needsAttention: NeedsAttentionItem[] }>> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/reports/dashboard');
      const data = res.data?.data;
      
      const metrics: DashboardMetrics = {
        totalPipelineValue: data?.sales_funnel?.value_by_stage?.reduce((acc: number, curr: any) => acc + Number(curr.total_value), 0) || 0,
        pipelineChangePercentage: 12.5, // Mocked as it's not in backend yet
        activeDealsCount: data?.sales_funnel?.value_by_stage?.reduce((acc: number, curr: any) => acc + Number(curr.count), 0) || 0,
        quotesAwaitingApprovalCount: 3, // Mocked
        activeNegotiationsCount: 2, // Mocked
        expectedMonthlyRevenue: data?.revenue_forecast?.length > 0 ? Number(data.revenue_forecast[0].expected_revenue) : 0,
        averageGrossMarginPercentage: 32.4, // Mocked
        atRiskDealsCount: data?.win_rate?.lost || 0,
        pendingFulfillmentCount: 5, // Mocked
      };

      const mockNeedsAttention = mockDb.getDashboardMetrics().needsAttention;

      return {
        success: true,
        data: { metrics, needsAttention: mockNeedsAttention },
        error: null,
      };
    } catch (err: any) {
      // Fallback to mock on failure
      return { success: true, data: mockDb.getDashboardMetrics(), error: null };
    }
  },
};
