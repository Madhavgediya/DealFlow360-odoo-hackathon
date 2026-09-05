import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { FulfillmentPlan } from '../../types/fulfillment';

export const fulfillmentApi = {
  getFulfillmentPlans: async (): Promise<ApiResponse<FulfillmentPlan[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getFulfillmentPlans());
  },
};
