import { apiClient, delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { AIChatMessage, DynamicChangeRecord, WhatIfSimulationResult } from '../../types/ai';

export const aiApi = {
  sendMessage: async (
    prompt: string,
    contextEntity?: { type: string; id: string; title: string }
  ): Promise<ApiResponse<AIChatMessage>> => {
    try {
      // 1. Attempt live backend RAG API
      const res = await apiClient.post('/ai/query', {
        prompt,
        contextEntity,
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch (err) {
      // Backend not running or in offline demo mode, fall back to rich client RAG engine
    }

    await delay(450); // Simulate RAG semantic retrieval & synthesis
    const response = mockDb.queryAI(prompt, contextEntity);
    return formatSuccessResponse(response);
  },

  getDynamicChanges: async (): Promise<ApiResponse<DynamicChangeRecord[]>> => {
    try {
      const res = await apiClient.get('/ai/changes');
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }

    await delay(200);
    const changes = mockDb.getDynamicChanges();
    return formatSuccessResponse(changes);
  },

  simulateWhatIf: async (params: {
    basePrice?: number;
    discountPercent?: number;
    unitCost?: number;
    quantity?: number;
    productId?: string;
  }): Promise<ApiResponse<WhatIfSimulationResult>> => {
    try {
      const res = await apiClient.post('/ai/simulate', {
        type: 'MARGIN_SIMULATION',
        params,
      });
      if (res.data && res.data.success && res.data.data) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }

    await delay(250);
    const result = mockDb.simulateWhatIf(params);
    return formatSuccessResponse(result);
  },
};
