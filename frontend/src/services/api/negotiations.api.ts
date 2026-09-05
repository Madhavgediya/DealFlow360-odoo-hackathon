import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { NegotiationSession, CustomerNegotiationPayload } from '../../types/negotiation';

export const negotiationsApi = {
  getNegotiationByQuoteId: async (quoteId: string): Promise<ApiResponse<NegotiationSession>> => {
    await delay(180);
    const session = mockDb.getNegotiationByQuoteId(quoteId);
    if (!session) throw new Error('Negotiation session not found');
    return formatSuccessResponse(session);
  },

  submitCustomerNegotiation: async (payload: CustomerNegotiationPayload): Promise<ApiResponse<NegotiationSession>> => {
    await delay(350);
    const session = mockDb.submitCustomerNegotiation(payload);
    return formatSuccessResponse(session, undefined, 'Counter proposal submitted. Reapproval workflow evaluated.');
  },
};
