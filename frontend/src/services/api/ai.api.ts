import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { AIChatMessage } from '../../types/ai';

export const aiApi = {
  sendMessage: async (prompt: string): Promise<ApiResponse<AIChatMessage>> => {
    await delay(600); // Simulate RAG retrieval & LLM generation
    const response = mockDb.queryAI(prompt);
    return formatSuccessResponse(response);
  },
};
