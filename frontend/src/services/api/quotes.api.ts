import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Quote, CreateQuotePayload, QuoteLineItem } from '../../types/quote';

export const quotesApi = {
  getQuotes: async (search?: string, status?: string): Promise<ApiResponse<Quote[]>> => {
    await delay(180);
    const data = mockDb.getQuotes(search, status);
    return formatSuccessResponse(data, { total: data.length });
  },

  getQuoteById: async (id: string): Promise<ApiResponse<Quote>> => {
    await delay(150);
    const quote = mockDb.getQuoteById(id);
    if (!quote) throw new Error('Quote not found');
    return formatSuccessResponse(quote);
  },

  createQuote: async (payload: CreateQuotePayload, salespersonId?: string, salespersonName?: string): Promise<ApiResponse<Quote>> => {
    await delay(300);
    const quote = mockDb.createQuote(payload, salespersonId, salespersonName);
    return formatSuccessResponse(quote, undefined, 'Quote created successfully!');
  },

  updateQuoteLines: async (
    quoteId: string,
    lines: QuoteLineItem[],
    modifierName?: string,
    modifierRole?: string
  ): Promise<ApiResponse<Quote>> => {
    await delay(250);
    const quote = mockDb.updateQuoteLines(quoteId, lines, modifierName, modifierRole);
    return formatSuccessResponse(quote, undefined, 'Quote line items updated and risk recalculated.');
  },

  confirmQuote: async (quoteId: string): Promise<ApiResponse<Quote>> => {
    await delay(300);
    const quote = mockDb.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');
    quote.status = 'CONFIRMED';
    quote.updatedAt = new Date().toISOString();
    return formatSuccessResponse(quote, undefined, 'Quote confirmed as Won Deal!');
  },
};
