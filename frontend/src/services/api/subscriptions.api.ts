import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Subscription, SubscriptionPlan, ProrationPreview } from '../../types/subscription';

export const subscriptionsApi = {
  getSubscriptions: async (): Promise<ApiResponse<Subscription[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getSubscriptions());
  },

  getPlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    await delay(120);
    return formatSuccessResponse(mockDb.getSubscriptionPlans());
  },

  previewProration: async (subscriptionId: string, targetPlanId: string): Promise<ApiResponse<ProrationPreview>> => {
    await delay(200);
    const result = mockDb.previewSubscriptionProration(subscriptionId, targetPlanId);
    return formatSuccessResponse(result);
  },
};
