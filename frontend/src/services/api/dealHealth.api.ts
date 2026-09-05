import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { DealHealthOverview } from '../../types/dealHealth';

export const dealHealthApi = {
  getOverview: async (): Promise<ApiResponse<DealHealthOverview>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getDealHealthOverview());
  },
};
