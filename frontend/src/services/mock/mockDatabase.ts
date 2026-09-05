import {
  SEED_COMPANIES,
  SEED_CATEGORIES,
  SEED_PRICE_LISTS,
  SEED_PRODUCTS,
  SEED_WAREHOUSES,
  SEED_STOCK_ITEMS,
  SEED_VENDORS,
  SEED_LEADS,
  SEED_CUSTOMERS,
  SEED_QUOTES,
  SEED_APPROVALS,
  SEED_NEGOTIATIONS,
  SEED_SUBSCRIPTION_PLANS,
  SEED_SUBSCRIPTIONS,
  SEED_PURCHASE_ORDERS,
  SEED_FULFILLMENT_PLANS,
  SEED_SHIPMENTS,
  SEED_INVOICES,
  SEED_DEAL_HEALTH,
} from './seedData';
import { Lead, LeadConversionPayload } from '../../types/crm';
import { Customer } from '../../types/customer';
import { Product, ProductCategory } from '../../types/product';
import { Quote, QuoteLineItem, CreateQuotePayload } from '../../types/quote';
import { ApprovalRequest, ApprovalActionPayload } from '../../types/approval';
import { NegotiationSession, CustomerNegotiationPayload } from '../../types/negotiation';
import { StockItem, Warehouse } from '../../types/inventory';
import { Vendor, VendorComparisonResult } from '../../types/vendor';
import { PurchaseOrder } from '../../types/procurement';
import { FulfillmentPlan } from '../../types/fulfillment';
import { Shipment } from '../../types/shipping';
import { Subscription, SubscriptionPlan, ProrationPreview } from '../../types/subscription';
import { Invoice, PaymentRecord } from '../../types/billing';
import { DealHealthOverview, DealHealthItem } from '../../types/dealHealth';
import { DashboardMetrics, NeedsAttentionItem } from '../../types/analytics';
import { AIChatMessage } from '../../types/ai';
import { calculateRiskAssessment } from '../../utils/risk';

class MockDatabase {
  private leads: Lead[] = [];
  private customers: Customer[] = [];
  private products: Product[] = [];
  private categories: ProductCategory[] = [];
  private warehouses: Warehouse[] = [];
  private stockItems: StockItem[] = [];
  private vendors: Vendor[] = [];
  private quotes: Quote[] = [];
  private approvals: ApprovalRequest[] = [];
  private negotiations: NegotiationSession[] = [];
  private subscriptions: Subscription[] = [];
  private subscriptionPlans: SubscriptionPlan[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private fulfillmentPlans: FulfillmentPlan[] = [];
  private shipments: Shipment[] = [];
  private invoices: Invoice[] = [];
  private dealHealthItems: DealHealthItem[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.leads = JSON.parse(JSON.stringify(SEED_LEADS));
    this.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.categories = JSON.parse(JSON.stringify(SEED_CATEGORIES));
    this.warehouses = JSON.parse(JSON.stringify(SEED_WAREHOUSES));
    this.stockItems = JSON.parse(JSON.stringify(SEED_STOCK_ITEMS));
    this.vendors = JSON.parse(JSON.stringify(SEED_VENDORS));
    this.quotes = JSON.parse(JSON.stringify(SEED_QUOTES));
    this.approvals = JSON.parse(JSON.stringify(SEED_APPROVALS));
    this.negotiations = JSON.parse(JSON.stringify(SEED_NEGOTIATIONS));
    this.subscriptions = JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS));
    this.subscriptionPlans = JSON.parse(JSON.stringify(SEED_SUBSCRIPTION_PLANS));
    this.purchaseOrders = JSON.parse(JSON.stringify(SEED_PURCHASE_ORDERS));
    this.fulfillmentPlans = JSON.parse(JSON.stringify(SEED_FULFILLMENT_PLANS));
    this.shipments = JSON.parse(JSON.stringify(SEED_SHIPMENTS));
    this.invoices = JSON.parse(JSON.stringify(SEED_INVOICES));
    this.dealHealthItems = JSON.parse(JSON.stringify(SEED_DEAL_HEALTH));
  }

  // --- CRM & LEADS ---
  public getLeads(search?: string, stage?: string): Lead[] {
    let result = this.leads;
    if (stage) {
      result = result.filter((l) => l.stage === stage);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public convertLeadToCustomer(payload: LeadConversionPayload): { customer: Customer; subscription?: Subscription } {
    const lead = this.getLeadById(payload.leadId);
    if (!lead) throw new Error('Lead not found');

    const customerId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: customerId,
      companyId: lead.companyId,
      name: payload.customerName || lead.companyName,
      code: `CUST-${lead.companyName.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      industry: lead.industry,
      tier: payload.tier,
      priceListId: 'pl-default',
      priceListName: 'Standard Commercial INR Price List',
      currency: 'INR',
      paymentTerms: payload.paymentTerms,
      creditLimit: payload.creditLimit,
      creditUsed: 0,
      status: payload.enableTrial ? 'TRIAL' : 'ACTIVE',
      trialStart: payload.enableTrial ? new Date().toISOString() : undefined,
      trialEnd: payload.enableTrial ? new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() : undefined,
      trialDaysRemaining: payload.enableTrial ? 7 : undefined,
      contacts: [
        {
          id: `cnt-${Date.now()}`,
          name: lead.fullName,
          email: payload.contactEmail || lead.email,
          phone: payload.contactPhone || lead.phone,
          role: 'Decision Maker',
          isPrimary: true,
        },
      ],
      billingAddress: { street: 'Main Corporate Blvd', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' },
      shippingAddress: { street: 'Main Corporate Blvd', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' },
      totalRevenue: 0,
      openDealsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.customers.unshift(newCustomer);

    // Update lead status
    lead.stage = 'CONVERTED';
    lead.convertedCustomerId = customerId;
    lead.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: 'Lead Converted to Customer',
      description: `Converted to ${newCustomer.name} with ${payload.enableTrial ? '7-Day Trial' : 'Standard'} Tier.`,
      performedBy: 'Account Executive',
      performedByRole: 'Sales Rep',
      createdAt: new Date().toISOString(),
    });

    let subscription: Subscription | undefined;
    if (payload.enableTrial) {
      subscription = {
        id: `sub-${Date.now()}`,
        companyId: lead.companyId,
        customerId: customerId,
        customerName: newCustomer.name,
        planId: payload.trialPlanId || 'sub-plan-2',
        planName: 'DealFlow360 Enterprise Deal OS',
        price: 360000,
        currency: 'INR',
        billingCycle: 'ANNUAL',
        status: 'TRIALING',
        startDate: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        trialStart: new Date().toISOString(),
        trialEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        trialDaysRemaining: 7,
        cancelAtPeriodEnd: false,
        seats: 25,
        invoicesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.subscriptions.unshift(subscription);
    }

    return { customer: newCustomer, subscription };
  }

  // --- CUSTOMERS ---
  public getCustomers(search?: string): Customer[] {
    let result = this.customers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    return result;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  // --- PRODUCTS & PRICING ---
  public getProducts(search?: string, categoryId?: string): Product[] {
    let result = this.products;
    if (categoryId) {
      result = result.filter((p) => p.categoryId === categoryId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getCategories(): ProductCategory[] {
    return this.categories;
  }

  // --- QUOTES & REAL-TIME RISK ---
  public getQuotes(search?: string, status?: string): Quote[] {
    let result = this.quotes;
    if (status) {
      result = result.filter((q) => q.status === status);
    }
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(query) ||
          q.customerName.toLowerCase().includes(query) ||
          q.salespersonName.toLowerCase().includes(query)
      );
    }
    return result;
  }

  public getQuoteById(id: string): Quote | undefined {
    return this.quotes.find((q) => q.id === id);
  }

  public createQuote(payload: CreateQuotePayload, salespersonId: string = 'usr-rep', salespersonName: string = 'Ananya Sharma'): Quote {
    const customer = this.getCustomerById(payload.customerId);
    if (!customer) throw new Error('Customer not found');

    const quoteId = `q-${Math.floor(1000 + Math.random() * 9000)}`;
    const quoteNumber = `Q-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalCost = 0;
    let totalTax = 0;

    const lines: QuoteLineItem[] = payload.lines.map((l, index) => {
      const product = this.getProductById(l.productId);
      if (!product) throw new Error(`Product ${l.productId} not found`);

      const unitPrice = l.unitPrice || product.basePrice;
      const unitCost = product.costPrice || unitPrice * 0.75;
      const lineSubtotal = unitPrice * l.quantity;
      const discountPercentage = l.discountPercentage || 0;
      const discountAmount = (lineSubtotal * discountPercentage) / 100;
      const taxableAmount = lineSubtotal - discountAmount;
      const taxAmount = (taxableAmount * product.taxRate) / 100;
      const lineTotal = taxableAmount + taxAmount;
      const lineTotalCost = unitCost * l.quantity;
      const lineMarginAmount = taxableAmount - lineTotalCost;
      const lineMarginPercentage = taxableAmount > 0 ? (lineMarginAmount / taxableAmount) * 100 : 0;

      subtotal += lineSubtotal;
      totalDiscountAmount += discountAmount;
      totalCost += lineTotalCost;
      totalTax += taxAmount;

      return {
        id: `line-${index + 1}`,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        quantity: l.quantity,
        unitPrice,
        discountPercentage,
        discountAmount,
        taxRate: product.taxRate,
        taxAmount,
        lineSubtotal,
        lineTotal,
        unitCost,
        totalCost: lineTotalCost,
        lineMarginAmount,
        lineMarginPercentage,
        warehouseId: l.warehouseId || 'wh-surat',
        warehouseName: 'Surat Central Logistics Hub',
        isRecurring: product.isRecurring,
        billingPeriod: product.subscriptionBillingPeriod,
        stockAvailable: product.totalStockAvailable || 10,
        stockShortage: Math.max(0, l.quantity - (product.totalStockAvailable || 10)),
      };
    });

    const netTaxable = subtotal - totalDiscountAmount;
    const grossMarginAmount = netTaxable - totalCost;
    const grossMarginPercentage = netTaxable > 0 ? (grossMarginAmount / netTaxable) * 100 : 0;
    const overallDiscountPercentage = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

    const riskAssessment = calculateRiskAssessment(lines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage);

    const approvalChain = [];
    if (riskAssessment.requiresApproval) {
      approvalChain.push({
        stepNumber: 1,
        roleRequired: 'SALES_MANAGER',
        roleName: 'Sales Director',
        approverName: 'Vikram Mehta',
        status: 'PENDING' as const,
        reason: riskAssessment.approvalReasons[0] || 'Discount / Margin threshold exceeded',
      });
      if (grossMarginPercentage < 18 || riskAssessment.overallSeverity === 'CRITICAL') {
        approvalChain.push({
          stepNumber: 2,
          roleRequired: 'FINANCE_DIRECTOR',
          roleName: 'CFO / Finance Controller',
          approverName: 'Rajesh Singhania',
          status: 'PENDING' as const,
          reason: 'Gross Margin below 18.0% hurdle rate',
        });
      }
    }

    const newQuote: Quote = {
      id: quoteId,
      quoteNumber,
      companyId: customer.companyId,
      customerId: customer.id,
      customerName: customer.name,
      customerCode: customer.code,
      customerTier: customer.tier,
      salespersonId,
      salespersonName,
      currency: payload.currency || customer.currency,
      priceListId: payload.priceListId || customer.priceListId,
      status: riskAssessment.requiresApproval ? 'APPROVAL_REQUIRED' : 'DRAFT',
      validUntil: payload.validUntil,
      paymentTerms: payload.paymentTerms,
      subtotal,
      discountAmount: totalDiscountAmount,
      discountPercentage: overallDiscountPercentage,
      taxAmount: totalTax,
      totalAmount: netTaxable + totalTax,
      totalCost,
      grossMarginAmount,
      grossMarginPercentage,
      riskAssessment,
      approvalChain,
      currentApprovalStep: riskAssessment.requiresApproval ? 1 : undefined,
      currentRevisionNumber: 1,
      revisions: [
        {
          revisionNumber: 1,
          createdAt: new Date().toISOString(),
          createdBy: salespersonName,
          createdByRole: 'Sales Rep',
          changeSummary: 'Initial Quote Creation',
          subtotal,
          discountAmount: totalDiscountAmount,
          totalAmount: netTaxable + totalTax,
          marginPercentage: grossMarginPercentage,
          riskScore: riskAssessment.overallScore,
          riskSeverity: riskAssessment.overallSeverity,
          lines,
        },
      ],
      reapprovalTriggered: false,
      lines,
      warehouseAllocationComplete: false,
      dealHealth: {
        healthScore: Math.max(10, 100 - riskAssessment.overallScore),
        status: riskAssessment.overallScore > 60 ? 'AT_RISK' : riskAssessment.overallScore > 30 ? 'WATCH' : 'HEALTHY',
        deliveryRisk: riskAssessment.fulfillmentRisk,
        stalledDays: 0,
        customerEngagementScore: 90,
        vendorRisk: 'LOW',
        marginRisk: riskAssessment.marginRisk,
        anomalies: riskAssessment.approvalReasons,
      },
      notes: payload.notes,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.quotes.unshift(newQuote);

    // If approval required, create approval inbox request
    if (riskAssessment.requiresApproval) {
      this.approvals.unshift({
        id: `appr-${quoteId}`,
        quoteId,
        quoteNumber,
        customerId: customer.id,
        customerName: customer.name,
        requestedById: salespersonId,
        requestedByName: salespersonName,
        totalAmount: newQuote.totalAmount,
        discountPercentage: overallDiscountPercentage,
        grossMarginPercentage,
        riskScore: riskAssessment.overallScore,
        riskSeverity: riskAssessment.overallSeverity,
        status: 'PENDING',
        currentStep: 1,
        totalSteps: approvalChain.length,
        requiredRole: 'SALES_MANAGER',
        reasons: riskAssessment.approvalReasons,
        riskAssessment,
        ageHours: 1,
        auditTrail: [
          {
            action: 'SUBMITTED',
            performedBy: salespersonName,
            performedByRole: 'Sales Rep',
            comments: 'Quote created with concession request.',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return newQuote;
  }

  public updateQuoteLines(
    quoteId: string,
    lines: QuoteLineItem[],
    modifierName: string = 'User',
    modifierRole: string = 'Sales'
  ): Quote {
    const quote = this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');

    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalCost = 0;
    let totalTax = 0;

    const updatedLines = lines.map((l) => {
      const lineSubtotal = l.unitPrice * l.quantity;
      const discountAmount = (lineSubtotal * l.discountPercentage) / 100;
      const taxableAmount = lineSubtotal - discountAmount;
      const taxAmount = (taxableAmount * l.taxRate) / 100;
      const lineTotal = taxableAmount + taxAmount;
      const lineTotalCost = l.unitCost * l.quantity;
      const lineMarginAmount = taxableAmount - lineTotalCost;
      const lineMarginPercentage = taxableAmount > 0 ? (lineMarginAmount / taxableAmount) * 100 : 0;

      subtotal += lineSubtotal;
      totalDiscountAmount += discountAmount;
      totalCost += lineTotalCost;
      totalTax += taxAmount;

      return {
        ...l,
        lineSubtotal,
        discountAmount,
        taxAmount,
        lineTotal,
        totalCost: lineTotalCost,
        lineMarginAmount,
        lineMarginPercentage,
      };
    });

    const netTaxable = subtotal - totalDiscountAmount;
    const grossMarginAmount = netTaxable - totalCost;
    const grossMarginPercentage = netTaxable > 0 ? (grossMarginAmount / netTaxable) * 100 : 0;
    const overallDiscountPercentage = subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

    const previousMargin = quote.grossMarginPercentage;
    const previousRiskScore = quote.riskAssessment.overallScore;

    const riskAssessment = calculateRiskAssessment(updatedLines, subtotal, totalDiscountAmount, totalCost, grossMarginPercentage);

    const reapprovalTriggered =
      (overallDiscountPercentage > quote.discountPercentage + 2 || grossMarginPercentage < previousMargin - 2) &&
      quote.status !== 'DRAFT';

    const newRevisionNumber = quote.currentRevisionNumber + 1;
    quote.revisions.unshift({
      revisionNumber: newRevisionNumber,
      createdAt: new Date().toISOString(),
      createdBy: modifierName,
      createdByRole: modifierRole,
      changeSummary: reapprovalTriggered ? 'Concession revised: Reapproval Triggered' : 'Line items adjusted',
      subtotal,
      discountAmount: totalDiscountAmount,
      totalAmount: netTaxable + totalTax,
      marginPercentage: grossMarginPercentage,
      riskScore: riskAssessment.overallScore,
      riskSeverity: riskAssessment.overallSeverity,
      lines: updatedLines,
      diffs: [
        { field: 'Gross Margin', oldValue: `${previousMargin.toFixed(1)}%`, newValue: `${grossMarginPercentage.toFixed(1)}%` },
        { field: 'Risk Score', oldValue: previousRiskScore, newValue: riskAssessment.overallScore },
      ],
    });

    quote.lines = updatedLines;
    quote.subtotal = subtotal;
    quote.discountAmount = totalDiscountAmount;
    quote.discountPercentage = overallDiscountPercentage;
    quote.taxAmount = totalTax;
    quote.totalAmount = netTaxable + totalTax;
    quote.totalCost = totalCost;
    quote.grossMarginAmount = grossMarginAmount;
    quote.grossMarginPercentage = grossMarginPercentage;
    quote.riskAssessment = riskAssessment;
    quote.currentRevisionNumber = newRevisionNumber;
    quote.version += 1;
    quote.updatedAt = new Date().toISOString();

    if (reapprovalTriggered) {
      quote.status = 'REAPPROVAL_REQUIRED';
      quote.reapprovalTriggered = true;
      quote.reapprovalReason = `Discount elevated to ${overallDiscountPercentage.toFixed(1)}%, reducing gross margin to ${grossMarginPercentage.toFixed(1)}%.`;
    }

    return quote;
  }

  // --- APPROVALS ---
  public getApprovals(status?: string): ApprovalRequest[] {
    let result = this.approvals;
    if (status) {
      result = result.filter((a) => a.status === status);
    }
    return result;
  }

  public getApprovalById(id: string): ApprovalRequest | undefined {
    return this.approvals.find((a) => a.id === id);
  }

  public handleApprovalAction(
    payload: ApprovalActionPayload,
    approverName: string = 'Vikram Mehta',
    approverRole: string = 'Sales Director'
  ): ApprovalRequest {
    const approval = this.getApprovalById(payload.approvalId);
    if (!approval) throw new Error('Approval request not found');

    const quote = this.getQuoteById(approval.quoteId);

    if (payload.action === 'APPROVE') {
      if (approval.currentStep < approval.totalSteps) {
        approval.currentStep += 1;
        approval.requiredRole = 'FINANCE_DIRECTOR';
        approval.auditTrail.unshift({
          action: 'APPROVED',
          performedBy: approverName,
          performedByRole: approverRole,
          comments: payload.comments || 'Step approved. Forwarded to CFO sign-off.',
          timestamp: new Date().toISOString(),
        });
        if (quote) {
          quote.status = 'APPROVAL_IN_PROGRESS';
          if (quote.approvalChain[0]) quote.approvalChain[0].status = 'APPROVED';
        }
      } else {
        approval.status = 'APPROVED';
        approval.auditTrail.unshift({
          action: 'APPROVED',
          performedBy: approverName,
          performedByRole: approverRole,
          comments: payload.comments || 'Final executive approval granted.',
          timestamp: new Date().toISOString(),
        });
        if (quote) {
          quote.status = 'APPROVED';
          quote.approvalChain.forEach((c) => (c.status = 'APPROVED'));
          quote.reapprovalTriggered = false;
        }
      }
    } else if (payload.action === 'REJECT') {
      approval.status = 'REJECTED';
      approval.auditTrail.unshift({
        action: 'REJECTED',
        performedBy: approverName,
        performedByRole: approverRole,
        comments: payload.reason || payload.comments || 'Discount concession rejected.',
        timestamp: new Date().toISOString(),
      });
      if (quote) {
        quote.status = 'REJECTED';
      }
    } else if (payload.action === 'REQUEST_CHANGES') {
      approval.auditTrail.unshift({
        action: 'CHANGES_REQUESTED',
        performedBy: approverName,
        performedByRole: approverRole,
        comments: payload.comments || 'Please revise discount closer to 12% ceiling.',
        timestamp: new Date().toISOString(),
      });
      if (quote) {
        quote.status = 'TEAM_REVIEW';
      }
    }

    approval.updatedAt = new Date().toISOString();
    return approval;
  }

  // --- NEGOTIATIONS ---
  public getNegotiationByQuoteId(quoteId: string): NegotiationSession | undefined {
    return this.negotiations.find((n) => n.quoteId === quoteId);
  }

  public submitCustomerNegotiation(payload: CustomerNegotiationPayload): NegotiationSession {
    const quote = this.getQuoteById(payload.quoteId);
    if (!quote) throw new Error('Quote not found');

    let session = this.getNegotiationByQuoteId(payload.quoteId);
    if (!session) {
      session = {
        id: `neg-${quote.id}`,
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        customerId: quote.customerId,
        customerName: quote.customerName,
        currentRound: 1,
        status: 'CUSTOMER_SUBMITTED',
        originalQuoteLines: JSON.parse(JSON.stringify(quote.lines)),
        currentQuoteLines: JSON.parse(JSON.stringify(quote.lines)),
        requestedQuoteLines: JSON.parse(JSON.stringify(quote.lines)),
        rounds: [],
        reapprovalRequired: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.negotiations.unshift(session);
    }

    // Apply customer requested changes
    const updatedLines = quote.lines.map((line) => {
      const mod = payload.lineModifications.find((m) => m.productId === line.productId);
      if (mod) {
        return {
          ...line,
          quantity: mod.requestedQuantity,
          discountPercentage: mod.requestedDiscount,
        };
      }
      return line;
    });

    this.updateQuoteLines(quote.id, updatedLines, 'Customer (Portal)', 'Client Decision Maker');

    session.rounds.unshift({
      roundNumber: session.currentRound + 1,
      status: 'CUSTOMER_REQUEST',
      initiatedBy: 'CUSTOMER',
      initiatorName: quote.customerName,
      customerMessage: payload.customerMessage,
      lineChanges: payload.lineModifications.map((m) => ({
        productId: m.productId,
        productName: quote.lines.find((l) => l.productId === m.productId)?.productName || 'Item',
        originalQuantity: quote.lines.find((l) => l.productId === m.productId)?.quantity || 1,
        requestedQuantity: m.requestedQuantity,
        originalDiscount: quote.lines.find((l) => l.productId === m.productId)?.discountPercentage || 0,
        requestedDiscount: m.requestedDiscount,
        originalUnitPrice: quote.lines.find((l) => l.productId === m.productId)?.unitPrice || 0,
      })),
      totalOriginal: quote.totalAmount,
      totalRequested: quote.totalAmount,
      marginOriginal: quote.grossMarginPercentage,
      marginImpact: -4.5,
      riskBefore: 'LOW',
      riskAfter: 'HIGH',
      reapprovalTriggered: true,
      reapprovalReason: 'Requested discount exceeds policy limits.',
      createdAt: new Date().toISOString(),
    });

    session.currentRound += 1;
    session.status = 'REAPPROVAL_PENDING';
    session.reapprovalRequired = true;
    session.updatedAt = new Date().toISOString();

    return session;
  }

  // --- INVENTORY & WAREHOUSES ---
  public getWarehouses(): Warehouse[] {
    return this.warehouses;
  }

  public getStockItems(warehouseId?: string): StockItem[] {
    if (warehouseId) {
      return this.stockItems.filter((s) => s.warehouseId === warehouseId);
    }
    return this.stockItems;
  }

  // --- VENDORS ---
  public getVendors(): Vendor[] {
    return this.vendors;
  }

  public getVendorById(id: string): Vendor | undefined {
    return this.vendors.find((v) => v.id === id);
  }

  public compareVendorsForProduct(productId: string, requiredQuantity: number = 10): VendorComparisonResult {
    const product = this.getProductById(productId);
    const vendorsWithProduct = this.vendors
      .filter((v) => v.products.some((p) => p.productId === productId))
      .map((v) => {
        const vp = v.products.find((p) => p.productId === productId)!;
        return {
          vendorId: v.id,
          vendorName: v.name,
          unitPrice: vp.unitCost,
          totalCost: vp.unitCost * requiredQuantity,
          leadTimeDays: vp.leadTimeDays,
          availability: vp.availability,
          reliabilityScore: v.reliabilityScore,
          overallScore: v.overallScore,
          isRecommended: v.status === 'PREFERRED' && vp.leadTimeDays <= 3,
          recommendationReason:
            v.status === 'PREFERRED' && vp.leadTimeDays <= 3
              ? `Fastest delivery (${vp.leadTimeDays} days) & 99% fulfillment reliability rating.`
              : undefined,
        };
      });

    // Sort by best score and shortest lead time
    vendorsWithProduct.sort((a, b) => b.overallScore - a.overallScore);

    const recommended = vendorsWithProduct.find((v) => v.isRecommended) || vendorsWithProduct[0];

    return {
      productId,
      productName: product?.name || 'Product',
      requiredQuantity,
      vendors: vendorsWithProduct,
      recommendedVendorId: recommended?.vendorId || 'ven-1',
    };
  }

  // --- PROCUREMENT & FULFILLMENT ---
  public getPurchaseOrders(): PurchaseOrder[] {
    return this.purchaseOrders;
  }

  public getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.find((p) => p.id === id);
  }

  public createPurchaseOrder(payload: {
    vendorId: string;
    linkedQuoteId?: string;
    targetWarehouseId: string;
    items: { productId: string; quantity: number }[];
  }): PurchaseOrder {
    const vendor = this.getVendorById(payload.vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const warehouse = this.warehouses.find((w) => w.id === payload.targetWarehouseId);

    const poId = `po-${Date.now()}`;
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    let subtotal = 0;
    const items = payload.items.map((it) => {
      const prod = this.getProductById(it.productId);
      const vp = vendor.products.find((p) => p.productId === it.productId);
      const unitCost = vp?.unitCost || prod?.costPrice || 100000;
      const lineTotal = unitCost * it.quantity;
      subtotal += lineTotal;
      return {
        productId: it.productId,
        productName: prod?.name || 'Item',
        productSku: prod?.sku || 'SKU',
        quantity: it.quantity,
        unitCost,
        lineTotal,
        receivedQuantity: 0,
      };
    });

    const taxAmount = subtotal * 0.18;

    const newPO: PurchaseOrder = {
      id: poId,
      poNumber,
      companyId: vendor.companyId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      linkedQuoteId: payload.linkedQuoteId,
      linkedQuoteNumber: payload.linkedQuoteId ? this.getQuoteById(payload.linkedQuoteId)?.quoteNumber : undefined,
      targetWarehouseId: payload.targetWarehouseId,
      targetWarehouseName: warehouse?.name || 'Surat Central Logistics Hub',
      status: 'CONFIRMED',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      items,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      timeline: [
        { status: 'DRAFT', updatedAt: new Date().toISOString(), note: 'Generated via DealFlow360 Procurement Engine', updatedBy: 'Procurement Specialist' },
        { status: 'CONFIRMED', updatedAt: new Date().toISOString(), note: 'Vendor verified purchase order requirements', updatedBy: vendor.contactPerson },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.purchaseOrders.unshift(newPO);
    return newPO;
  }

  public getFulfillmentPlans(): FulfillmentPlan[] {
    return this.fulfillmentPlans;
  }

  public getShipments(): Shipment[] {
    return this.shipments;
  }

  public getShipmentById(id: string): Shipment | undefined {
    return this.shipments.find((s) => s.id === id);
  }

  // --- SUBSCRIPTIONS & BILLING ---
  public getSubscriptions(): Subscription[] {
    return this.subscriptions;
  }

  public getSubscriptionPlans(): SubscriptionPlan[] {
    return this.subscriptionPlans;
  }

  public previewSubscriptionProration(subscriptionId: string, targetPlanId: string): ProrationPreview {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    const targetPlan = this.subscriptionPlans.find((p) => p.id === targetPlanId);
    if (!sub || !targetPlan) throw new Error('Subscription or Plan not found');

    const unusedCredit = sub.price * 0.45;
    const newCharge = targetPlan.price;
    const netDue = Math.max(0, newCharge - unusedCredit);

    return {
      currentPlanId: sub.planId,
      newPlanId: targetPlan.id,
      effectiveDate: new Date().toISOString(),
      unusedCurrentPlanCredit: unusedCredit,
      newPlanCharge: newCharge,
      netDueNow: netDue,
      nextRenewalDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    };
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((i) => i.id === id);
  }

  public recordInvoicePayment(invoiceId: string, amount: number, paymentMethod: any, reference: string): Invoice {
    const inv = this.getInvoiceById(invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount,
      currency: inv.currency,
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      transactionReference: reference || `REF-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
    };

    inv.payments.push(payment);
    inv.amountPaid += amount;
    inv.amountDue = Math.max(0, inv.totalAmount - inv.amountPaid);
    inv.status = inv.amountDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
    inv.updatedAt = new Date().toISOString();

    return inv;
  }

  // --- DEAL HEALTH & ANALYTICS ---
  public getDealHealthOverview(): DealHealthOverview {
    const healthy = this.dealHealthItems.filter((d) => d.healthStatus === 'HEALTHY').length;
    const watch = this.dealHealthItems.filter((d) => d.healthStatus === 'WATCH').length;
    const atRisk = this.dealHealthItems.filter((d) => d.healthStatus === 'AT_RISK').length;
    const critical = this.dealHealthItems.filter((d) => d.healthStatus === 'CRITICAL').length;

    const totalDeals = this.dealHealthItems.length;
    const atRiskRevenue = this.dealHealthItems
      .filter((d) => d.healthStatus === 'AT_RISK' || d.healthStatus === 'CRITICAL')
      .reduce((acc, curr) => acc + curr.totalValue, 0);

    return {
      healthyCount: healthy,
      watchCount: watch,
      atRiskCount: atRisk,
      criticalCount: critical,
      totalDealsTracked: totalDeals,
      averageHealthScore: 78.5,
      atRiskRevenue,
      deals: this.dealHealthItems,
    };
  }

  public getDashboardMetrics(): {
    metrics: DashboardMetrics;
    needsAttention: NeedsAttentionItem[];
  } {
    return {
      metrics: {
        totalPipelineValue: 48500000,
        pipelineChangePercentage: 14.8,
        activeDealsCount: 24,
        quotesAwaitingApprovalCount: this.approvals.filter((a) => a.status === 'PENDING').length,
        activeNegotiationsCount: this.negotiations.filter((n) => n.status !== 'ACCEPTED').length,
        expectedMonthlyRevenue: 18200000,
        averageGrossMarginPercentage: 21.4,
        atRiskDealsCount: this.dealHealthItems.filter((d) => d.healthStatus === 'AT_RISK' || d.healthStatus === 'CRITICAL').length,
        pendingFulfillmentCount: 6,
      },
      needsAttention: [
        {
          id: 'na-1',
          type: 'REAPPROVAL',
          severity: 'CRITICAL',
          title: 'Quote Q-1024 Exceeds Category Limit (+8%)',
          description: 'Customer negotiation elevated discount from 10% to 18%, compressing margin to 16.5%. Reapproval pending.',
          relatedEntity: 'APPROVAL',
          relatedId: 'appr-1024',
          actionRoute: '/approvals/appr-1024',
          timestamp: '18m ago',
        },
        {
          id: 'na-2',
          type: 'STOCK_SHORTAGE',
          severity: 'HIGH',
          title: 'Warehouse Shortage: Surat Central',
          description: 'UltraBook Pro X1 deficit of 15 units detected for deal fulfillment. Vendor PO required.',
          relatedEntity: 'INVENTORY',
          relatedId: 'stk-1a',
          actionRoute: '/inventory/stock',
          timestamp: '45m ago',
        },
        {
          id: 'na-3',
          type: 'APPROVAL_DELAY',
          severity: 'HIGH',
          title: 'Approval Pending > 18 Hours',
          description: 'Strategic Quantum Cloud deal Q-1024 waiting on CFO Rajesh Singhania sign-off.',
          relatedEntity: 'APPROVAL',
          relatedId: 'appr-1024',
          actionRoute: '/approvals/appr-1024',
          timestamp: '18h ago',
        },
        {
          id: 'na-4',
          type: 'STALLED_DEAL',
          severity: 'MEDIUM',
          title: 'Razorpay Deal Stalled for 5 Days',
          description: 'No activity recorded since last proposal review. Follow-up recommended.',
          relatedEntity: 'QUOTE',
          relatedId: 'q-1021',
          actionRoute: '/sales/quotes/q-1020',
          timestamp: '5d ago',
        },
      ],
    };
  }

  // --- AI COPILOT RAG ENGINE ---
  public queryAI(prompt: string): AIChatMessage {
    const q = prompt.toLowerCase();
    const heroQuote = this.getQuoteById('q-1024');

    if (q.includes('q-1024') || q.includes('blocked') || q.includes('approval')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: `**Quote Q-1024** is currently in **APPROVAL_REQUIRED** status due to two policy violations:

1. **Category Discount Limit Exceeded**: Requested discount of **18.0%** on UltraBook Pro X1 Carbon exceeds the category ceiling of **10.0%** by **+8.0%**.
2. **Gross Margin Compression**: Deal gross margin dropped to **16.5%**, which is below the corporate hurdle rate of **18.0%**.

The approval chain currently requires sign-off from **Sales Director (Vikram Mehta)** and **Finance Director (Rajesh Singhania)**.`,
        timestamp: new Date().toISOString(),
        confidenceScore: 99,
        sources: [
          {
            title: 'Category Discount Governance Policy (Rule CAT-LAPTOPS-01)',
            type: 'POLICY',
            referenceId: 'cat-1',
            excerpt: 'Category "Enterprise Laptops" maximum rep discretionary discount is 10.0%. Any excess triggers Sales Director sign-off.',
          },
          {
            title: 'Quote Q-1024 Risk Assessment Engine',
            type: 'QUOTE_RISK',
            referenceId: 'q-1024',
            excerpt: 'Overall Risk Score: 78 (HIGH). Discount Risk: CRITICAL (18% applied). Margin Risk: HIGH (16.5% vs 18% floor).',
          },
        ],
        dataUsed: {
          quoteNumber: 'Q-1024',
          discount: '18.0%',
          allowedLimit: '10.0%',
          margin: '16.5%',
          minMargin: '18.0%',
          pendingApprover: 'Vikram Mehta (Sales Director)',
        },
        suggestedActions: [
          {
            label: 'Review Approval in Inbox',
            actionType: 'NAVIGATE',
            payload: { quoteId: 'q-1024' },
            route: '/approvals/appr-1024',
          },
          {
            label: 'View Negotiation Diff',
            actionType: 'NAVIGATE',
            payload: { quoteId: 'q-1024' },
            route: '/sales/negotiations/q-1024',
          },
        ],
      };
    }

    if (q.includes('vendor') || q.includes('shortage') || q.includes('laptop') || q.includes('procure')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: `For the **UltraBook Pro X1 Carbon** inventory deficit, I recommend selecting **Precision Silicon Distributing Ltd (Vendor A)**.

**Analysis:**
- **Lead Time**: 2 Days (vs 5 Days from Velocity Networks)
- **Fulfillment Reliability**: 96% Score
- **Unit Cost**: ₹ 125,000 (saves ₹ 3,000 per unit compared to baseline)
- **Current Status**: In Stock & Preferred Partner`,
        timestamp: new Date().toISOString(),
        confidenceScore: 97,
        sources: [
          {
            title: 'Vendor Performance Matrix (VEN-PSD-01)',
            type: 'VENDOR_SCORE',
            referenceId: 'ven-1',
            excerpt: 'Precision Silicon Distributing maintains 99% on-time delivery rate with 2-day SLAs in Gujarat & Maharashtra.',
          },
        ],
        dataUsed: {
          recommendedVendor: 'Precision Silicon Distributing Ltd',
          leadTime: '2 Days',
          reliabilityScore: 96,
          unitCost: 125000,
        },
        suggestedActions: [
          {
            label: 'Compare Vendors Side-by-Side',
            actionType: 'NAVIGATE',
            payload: { productId: 'prod-1' },
            route: '/vendors',
          },
          {
            label: 'Generate Purchase Order',
            actionType: 'NAVIGATE',
            payload: { vendorId: 'ven-1' },
            route: '/procurement/purchase-orders',
          },
        ],
      };
    }

    if (q.includes('risk') || q.includes('stalled') || q.includes('deal health')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: `Currently tracking **2 deals requiring attention**:

1. **Razorpay Financial Tech (Q-1021)**: Stalled for **5 days** due to warehouse inventory shortage (Health Score: 42 - AT RISK).
2. **Quantum Cloud Corp (Q-1024)**: Margin compression to 16.5% awaiting CFO sign-off (Health Score: 68 - WATCH).

Total pipeline revenue at risk: **₹ 4,627,130**.`,
        timestamp: new Date().toISOString(),
        confidenceScore: 95,
        sources: [
          {
            title: 'Deal Health Anomaly Detector',
            type: 'DEAL_HEALTH',
            excerpt: 'Monitors days since last customer touchpoint, stock availability, and margin erosion.',
          },
        ],
        suggestedActions: [
          {
            label: 'Open Deal Health Dashboard',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/deal-health',
          },
        ],
      };
    }

    // Default intelligent response
    return {
      id: `ai-${Date.now()}`,
      sender: 'ASSISTANT',
      text: `Based on your query: *"I analyzed our enterprise deal records across CRM, Quotes, Inventory, and Approvals."*

- **Active Pipeline**: ₹ 48.5M across 24 qualified deals
- **Pending Approvals**: 1 deal (Q-1024)
- **Fulfillment**: 4 Warehouses operational with 92% on-time fulfillment rate.`,
      timestamp: new Date().toISOString(),
      confidenceScore: 91,
      suggestedActions: [
        {
          label: 'View Dashboard Analytics',
          actionType: 'NAVIGATE',
          payload: {},
          route: '/dashboard',
        },
      ],
    };
  }
}

export const mockDb = new MockDatabase();
