import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { DashboardMetrics, NeedsAttentionItem } from '../../types/analytics';

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<ApiResponse<{ metrics: DashboardMetrics; needsAttention: NeedsAttentionItem[] }>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getDashboardMetrics());
  },
};
