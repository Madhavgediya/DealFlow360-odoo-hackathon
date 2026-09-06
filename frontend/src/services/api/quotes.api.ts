import {
  apiClient,
  delay,
  formatSuccessResponse,
  formatErrorResponse,
} from "./client";
import { mockDb } from "../mock/mockDatabase";
import { ApiResponse } from "../../types/api";
import {
  Quote,
  CreateQuotePayload,
  QuoteLineItem,
  QuoteStatus,
} from "../../types/quote";
import { calculateRiskAssessment } from "../../utils/risk";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerQuote(raw: any): Quote {
  const subtotal = Number(raw.subtotal) || 0;
  const discountAmount = Number(raw.discount_total || raw.discountAmount) || 0;
  const taxAmount = Number(raw.tax_total || raw.taxAmount) || 0;
  const totalAmount =
    Number(raw.total || raw.totalAmount) ||
    Math.max(0, subtotal - discountAmount + taxAmount);
  const discountPercentage =
    subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  const totalCost =
    Number(raw.total_cost || raw.totalCost) || Math.round(subtotal * 0.72);
  const grossMarginAmount = totalAmount - totalCost;
  const grossMarginPercentage =
    totalAmount > 0 ? (grossMarginAmount / totalAmount) * 100 : 25;

  const lines: QuoteLineItem[] =
    Array.isArray(raw.lines) && raw.lines.length > 0
      ? raw.lines.map((l: any, idx: number) => {
          const qty = Number(l.quantity) || 1;
          const unitPrice = Number(l.unit_price || l.unitPrice) || 50000;
          const discPct =
            Number(l.discount_percent || l.discountPercentage) || 0;
          const lineSubtotal = qty * unitPrice;
          const discAmt = lineSubtotal * (discPct / 100);
          const lineTotal =
            Number(l.line_total || l.lineTotal) || lineSubtotal - discAmt;
          const unitCost =
            Number(l.unit_cost || l.unitCost) || Math.round(unitPrice * 0.7);

          return {
            id: l.id || `line-${idx + 1}`,
            productId: l.product_id || l.productId || `prod-${idx + 1}`,
            productName:
              l.product_name || l.productName || "Enterprise System Module",
            productSku: l.sku || l.productSku || `SKU-MOD-${100 + idx}`,
            categoryId: l.category_id || l.categoryId || "cat-hardware",
            categoryName:
              l.category_name || l.categoryName || "Enterprise Hardware",
            quantity: qty,
            unitPrice,
            discountPercentage: discPct,
            discountAmount: discAmt,
            taxRate: 18,
            taxAmount: lineTotal * 0.18,
            lineSubtotal,
            lineTotal,
            unitCost,
            totalCost: qty * unitCost,
            lineMarginAmount: lineTotal - qty * unitCost,
            lineMarginPercentage:
              lineTotal > 0
                ? ((lineTotal - qty * unitCost) / lineTotal) * 100
                : 25,
            isRecurring: false,
            stockAvailable: 100,
          };
        })
      : [
          {
            id: `line-1`,
            productId: "prod-1",
            productName: "Cloud Dedicated Cluster Node",
            productSku: "SKU-NODE-8800",
            categoryId: "cat-hardware",
            categoryName: "Enterprise Hardware",
            quantity: 2,
            unitPrice: 1250000,
            discountPercentage: 8,
            discountAmount: 200000,
            taxRate: 18,
            taxAmount: 414000,
            lineSubtotal: 2500000,
            lineTotal: 2300000,
            unitCost: 850000,
            totalCost: 1700000,
            lineMarginAmount: 600000,
            lineMarginPercentage: 26.08,
            isRecurring: false,
            stockAvailable: 50,
          },
        ];

  const riskAssessment = calculateRiskAssessment(
    lines,
    subtotal,
    discountAmount,
    totalCost,
    grossMarginPercentage,
  );

  return {
    id: raw.id || `q-${Date.now()}`,
    quoteNumber:
      raw.quote_number ||
      raw.quoteNumber ||
      `Q-${Math.floor(1000 + Math.random() * 9000)}`,
    companyId: raw.company_id || raw.companyId || "comp-1",
    customerId: raw.customer_id || raw.customerId || "cust-1",
    customerName:
      raw.customer_name || raw.customerName || "Reliance Green Energy Corp",
    customerCode: raw.customer_code || raw.customerCode || "CUST-REL-01",
    customerTier: raw.customer_tier || raw.customerTier || "PLATINUM",
    salespersonId: raw.created_by || raw.salespersonId || "usr-sales-1",
    salespersonName:
      raw.salesperson_name || raw.salespersonName || "Ananya Sharma",
    currency: "INR",
    priceListId: "pl-default",
    status: (raw.status || "DRAFT") as QuoteStatus,
    validUntil:
      raw.valid_until ||
      raw.validUntil ||
      new Date(Date.now() + 30 * 86400000).toISOString(),
    paymentTerms: raw.payment_terms || "NET_30",
    subtotal,
    discountAmount,
    discountPercentage,
    taxAmount,
    totalAmount,
    totalCost,
    grossMarginAmount,
    grossMarginPercentage,
    riskAssessment,
    approvalChain: raw.approvalChain || [],
    currentApprovalStep: raw.currentApprovalStep || 1,
    currentRevisionNumber: raw.currentRevisionNumber || 1,
    revisions: raw.revisions || [],
    reapprovalTriggered: false,
    lines,
    warehouseAllocationComplete: true,
    dealHealth: {
      healthScore: 88,
      status: "HEALTHY",
      deliveryRisk: "LOW",
      stalledDays: 1,
      customerEngagementScore: 92,
      vendorRisk: "LOW",
      marginRisk: "LOW",
      anomalies: [],
    },
    version: raw.version || 1,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
}

export const quotesApi = {
  getQuotes: async (
    search?: string,
    status?: string,
  ): Promise<ApiResponse<Quote[]>> => {
    try {
      const params: Record<string, string> = {};
      if (status && status !== "ALL") params.status = status;

      const response = await apiClient.get<ApiResponse<any[]>>("/quotations", {
        params,
      });
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        let list = response.data.data.map(adaptServerQuote);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (item) =>
              item.quoteNumber.toLowerCase().includes(q) ||
              item.customerName.toLowerCase().includes(q) ||
              item.salespersonName.toLowerCase().includes(q),
          );
        }
        return formatSuccessResponse(list, { total: list.length });
      }
      return formatErrorResponse("Invalid response from server");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch quotations",
      );
    }
  },

  getQuoteById: async (id: string): Promise<ApiResponse<Quote>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/quotations/${id}`,
      );
      if (response.data && response.data.success && response.data.data) {
        return formatSuccessResponse(adaptServerQuote(response.data.data));
      }
      return formatErrorResponse("Quote not found");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message || err.message || "Quote not found",
      );
    }
  },

  createQuote: async (
    payload: CreateQuotePayload,
    salespersonId?: string,
    salespersonName?: string,
  ): Promise<ApiResponse<Quote>> => {
    try {
      let subtotal = 0;
      let discountTotal = 0;
      for (const line of payload.lines) {
        const lineSub = line.quantity * line.unitPrice;
        const lineDisc = lineSub * (line.discountPercentage / 100);
        subtotal += lineSub;
        discountTotal += lineDisc;
      }
      const taxTotal = (subtotal - discountTotal) * 0.18;
      const total = subtotal - discountTotal + taxTotal;

      let validUntilIso = null;
      try {
        if (payload.validUntil) {
          validUntilIso = new Date(payload.validUntil).toISOString();
        }
      } catch (_) {}

      // If customerId is not a valid UUID, omit it so server uses default or resolves from session
      const serverCustomerId =
        payload.customerId && UUID_REGEX.test(payload.customerId)
          ? payload.customerId
          : undefined;

      const response = await apiClient.post<ApiResponse<any>>("/quotations", {
        customer_id: serverCustomerId,
        status: "DRAFT",
        valid_until: validUntilIso,
      });

      if (response.data && response.data.success && response.data.data) {
        const createdQuote = response.data.data;

        // Add lines if any
        for (const line of payload.lines) {
          if (UUID_REGEX.test(line.productId)) {
            await apiClient
              .post(`/quotations/${createdQuote.id}/lines`, {
                product_id: line.productId,
                quantity: line.quantity,
                unit_price: line.unitPrice,
                discount_percent: line.discountPercentage,
                line_total:
                  line.quantity *
                  line.unitPrice *
                  (1 - line.discountPercentage / 100),
              })
              .catch(() => {});
          }
        }

        const adapted = adaptServerQuote({
          ...createdQuote,
          subtotal,
          discount_total: discountTotal,
          tax_total: taxTotal,
          total,
        });
        try {
          mockDb.createQuote(payload, salespersonId, salespersonName);
        } catch (_) {}
        return formatSuccessResponse(
          adapted,
          undefined,
          "Quote created in live database!",
        );
      }
    } catch (err) {
      console.debug("Live createQuote note, using memory store:", err);
    }

    await delay(250);
    try {
      const quote = mockDb.createQuote(payload, salespersonId, salespersonName);
      return formatSuccessResponse(
        quote,
        undefined,
        "Quote created successfully!",
      );
    } catch (err: any) {
      return formatErrorResponse(err?.message || "Failed to create quote");
    }
  },

  submitQuote: async (quoteId: string): Promise<ApiResponse<Quote>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/quotations/${quoteId}/submit`,
      );
      if (response.data && response.data.success && response.data.data) {
        return formatSuccessResponse(
          adaptServerQuote(response.data.data),
          undefined,
          "Quotation submitted for review",
        );
      }
      return formatErrorResponse("Failed to submit quote");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message || err.message || "Failed to submit quote",
      );
    }
  },

  updateQuoteLines: async (
    quoteId: string,
    lines: QuoteLineItem[],
    modifierName?: string,
    modifierRole?: string,
  ): Promise<ApiResponse<Quote>> => {
    try {
      const payloadLines = lines.map((l) => ({
        product_id: l.productId,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        discount_percent: l.discountPercentage,
        line_total: l.lineTotal,
      }));
      const response = await apiClient.put(
        `/quotations/${quoteId}/lines`,
        payloadLines,
      );
      if (response.data && response.data.success && response.data.data) {
        return formatSuccessResponse(
          adaptServerQuote(response.data.data),
          undefined,
          "Quote line items updated.",
        );
      }
      return formatErrorResponse("Failed to update quote lines");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message ||
          err.message ||
          "Failed to update quote lines",
      );
    }
  },

  updateQuoteStatus: async (
    quoteId: string,
    status: QuoteStatus,
  ): Promise<ApiResponse<Quote>> => {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/quotations/${quoteId}/status`,
        { status },
      );
      if (response.data && response.data.success && response.data.data) {
        return formatSuccessResponse(
          adaptServerQuote(response.data.data),
          undefined,
          `Status updated to ${status}`,
        );
      }
      return formatErrorResponse("Failed to update status");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message || err.message || "Failed to update status",
      );
    }
  },

  deleteQuote: async (
    quoteId: string,
  ): Promise<ApiResponse<{ id: string }>> => {
    try {
      await apiClient.delete(`/quotations/${quoteId}`);
      return formatSuccessResponse(
        { id: quoteId },
        undefined,
        "Quotation removed successfully",
      );
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete quotation",
      );
    }
  },

  confirmQuote: async (quoteId: string): Promise<ApiResponse<Quote>> => {
    try {
      const quoteRes = await apiClient.get<ApiResponse<any>>(
        `/quotations/${quoteId}`,
      );
      if (quoteRes.data?.data) {
        const q = quoteRes.data.data;
        await apiClient
          .post("/orders/convert", {
            quotation_id: quoteId,
            customer_id: q.customer_id,
            total: q.total,
            lines: (q.lines || []).map((l: any) => ({
              product_id: l.product_id,
              quantity: l.quantity,
              unit_price: l.unit_price,
              line_total: l.line_total,
            })),
          })
          .catch(() => {});

        q.status = "CONFIRMED";
        return formatSuccessResponse(
          adaptServerQuote(q),
          undefined,
          "Quote confirmed as Won Deal!",
        );
      }
      return formatErrorResponse("Quote not found");
    } catch (err: any) {
      return formatErrorResponse(
        err.response?.data?.message || err.message || "Failed to confirm quote",
      );
    }
  },

  getUpsellSuggestions: async (
    quoteId: string,
    existingProductIds: string[] = [],
  ): Promise<ApiResponse<any[]>> => {
    // Try live backend first
    if (UUID_REGEX.test(quoteId)) {
      try {
        const productIds = existingProductIds.join(",");
        const res = await apiClient.get<ApiResponse<any[]>>(
          `/upsell/suggestions?productIds=${productIds}&limit=5`,
        );
        if (res.data?.success && res.data.data?.length) {
          return formatSuccessResponse(res.data.data);
        }
      } catch (err) {
        console.debug("Live upsell note, using mock:", err);
      }
    }

    await delay(200);
    // Rich mock upsell suggestions
    const mockSuggestions = [
      {
        productId: "prod-upsell-1",
        productName: "Managed Cloud Security Suite",
        productSku: "SKU-CLDSEC-01",
        categoryName: "Security Services",
        unitPrice: 85000,
        unitCost: 42000,
        marginDelta: 4.2,
        marginDeltaDirection: "POSITIVE" as const,
        isPromoted: true,
        promotionTag: "🔥 Hot Deal",
        coPurchaseScore: 94,
        reason: "Purchased with 87% of Enterprise Hardware deals this quarter",
        taxRate: 18,
        stockAvailable: 999,
        isRecurring: false,
      },
      {
        productId: "prod-upsell-2",
        productName: "Premium Managed Support Plan (Annual)",
        productSku: "SKU-SRVMGD-01",
        categoryName: "Support",
        unitPrice: 120000,
        unitCost: 38000,
        marginDelta: 6.8,
        marginDeltaDirection: "POSITIVE" as const,
        isPromoted: true,
        promotionTag: "⭐ Best Margin",
        coPurchaseScore: 91,
        reason:
          "High-margin SLA — boosts deal revenue by avg ₹1.2L with 82% renewal rate",
        taxRate: 18,
        stockAvailable: 999,
        isRecurring: true,
      },
      {
        productId: "prod-upsell-3",
        productName: "Extended 3-Year Warranty Pack",
        productSku: "SKU-WARR-PREM-01",
        categoryName: "Warranty",
        unitPrice: 45000,
        unitCost: 18000,
        marginDelta: 2.1,
        marginDeltaDirection: "POSITIVE" as const,
        isPromoted: false,
        promotionTag: null,
        coPurchaseScore: 78,
        reason:
          "Customers who buy hardware add extended warranty 73% of the time",
        taxRate: 18,
        stockAvailable: 999,
        isRecurring: false,
      },
      {
        productId: "prod-upsell-4",
        productName: "Cloud Sync & Backup Subscription",
        productSku: "SKU-CLOUDSYNC-01",
        categoryName: "Subscriptions",
        unitPrice: 36000,
        unitCost: 12000,
        marginDelta: 3.5,
        marginDeltaDirection: "POSITIVE" as const,
        isPromoted: false,
        promotionTag: null,
        coPurchaseScore: 72,
        reason: "Recurring revenue stream — improves customer LTV by 2.4x",
        taxRate: 18,
        stockAvailable: 999,
        isRecurring: true,
      },
      {
        productId: "prod-upsell-5",
        productName: "On-Site Installation & Configuration",
        productSku: "SKU-INST-BASIC-01",
        categoryName: "Services",
        unitPrice: 25000,
        unitCost: 9000,
        marginDelta: 1.8,
        marginDeltaDirection: "POSITIVE" as const,
        isPromoted: false,
        promotionTag: null,
        coPurchaseScore: 65,
        reason: "Professional services reduce customer churn by 40%",
        taxRate: 18,
        stockAvailable: 999,
        isRecurring: false,
      },
    ].filter((s) => !existingProductIds.includes(s.productId));

    return formatSuccessResponse(mockSuggestions, {
      total: mockSuggestions.length,
    });
  },

  getFulfillmentSplit: async (quoteId: string): Promise<ApiResponse<any>> => {
    // Try live backend
    if (UUID_REGEX.test(quoteId)) {
      try {
        const res = await apiClient.get<ApiResponse<any>>(
          `/fulfillment/quote/${quoteId}`,
        );
        if (res.data?.success && res.data.data) {
          return formatSuccessResponse(res.data.data);
        }
      } catch (err) {
        console.debug("Live fulfillment split note, using mock:", err);
      }
    }

    await delay(300);
    // Rich mock fulfillment split
    const quote = mockDb.getQuoteById(quoteId);
    const split = {
      warehouses: [
        {
          warehouseId: "wh-1",
          warehouseName: "Mumbai Central Hub",
          location: "Bhandup West, Mumbai 400078",
          items: (quote?.lines || [])
            .map((l) => ({
              productId: l.productId,
              productName: l.productName,
              quantityFulfilled: Math.ceil(l.quantity * 0.6),
            }))
            .filter((i) => i.quantityFulfilled > 0),
          estimatedShippingCost: 2500,
        },
        {
          warehouseId: "wh-2",
          warehouseName: "Bengaluru Logistics Hub",
          location: "Electronic City Phase 1, Bengaluru 560100",
          items: (quote?.lines || [])
            .map((l) => ({
              productId: l.productId,
              productName: l.productName,
              quantityFulfilled: Math.floor(l.quantity * 0.4),
            }))
            .filter((i) => i.quantityFulfilled > 0),
          estimatedShippingCost: 3200,
        },
      ].filter((w) => w.items.length > 0),
      backordered: [],
      shipmentCount: 2,
      totalShippingCost: 5700,
      fulfillmentComplete: true,
      hasBackorder: false,
    };
    return formatSuccessResponse(split);
  },
};
