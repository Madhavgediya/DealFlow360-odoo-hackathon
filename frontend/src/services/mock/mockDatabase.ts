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
import { AIChatMessage, DynamicChangeRecord, WhatIfSimulationResult } from '../../types/ai';
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

  public addLead(lead: Lead): Lead {
    this.leads.unshift(lead);
    return lead;
  }

  public addCustomer(customer: Customer): Customer {
    this.customers.unshift(customer);
    return customer;
  }

  public addProduct(product: Product): Product {
    this.products.unshift(product);
    return product;
  }

  public addWarehouse(wh: Warehouse): Warehouse {
    this.warehouses.unshift(wh);
    return wh;
  }

  public addStockItem(item: StockItem): StockItem {
    this.stockItems.unshift(item);
    return item;
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

  // --- AI COPILOT RAG ENGINE (DYNAMIC CLIENT-SIDE BACKED BY LIVE REPO STATE) ---
  public queryAI(prompt: string, contextEntity?: { type: string; id: string; title: string }): AIChatMessage {
    const q = prompt.toLowerCase();

    // 1. If asking about a specific Quote or active context is QUOTE
    const quoteIdMatch = q.match(/q-\d+/i);
    const targetQuoteId = quoteIdMatch ? quoteIdMatch[0].toLowerCase() : (contextEntity?.type === 'QUOTE' ? contextEntity.id : null);

    if (targetQuoteId) {
      const quote = this.getQuoteById(targetQuoteId);
      if (quote) {
        const approval = this.approvals.find(a => a.quoteId === quote.id);
        const margin = quote.grossMarginPercentage || 0;
        const discount = quote.discountPercentage || 0;
        const isBlocked = quote.status === 'APPROVAL_REQUIRED' || quote.status === 'REAPPROVAL_REQUIRED';

        let analysis = `**Quote ${quote.quoteNumber} Analysis (${quote.customerName})**:\n`;
        analysis += `- **Total Deal Value**: ₹ ${(quote.totalAmount || 0).toLocaleString()}\n`;
        analysis += `- **Current Status**: \`${quote.status}\` (Revision: \`v${quote.currentRevisionNumber}\`)\n`;
        analysis += `- **Overall Discount**: **${discount.toFixed(1)}%** | **Gross Margin**: **${margin.toFixed(1)}%**\n`;
        analysis += `- **Risk Score**: **${quote.riskAssessment?.overallScore || 45} / 100** (\`${quote.riskAssessment?.overallSeverity || 'MEDIUM'}\`)\n\n`;

        if (isBlocked) {
          analysis += `⚠️ **Approval Blocker Detected**:
${quote.reapprovalReason || `Discount of ${discount.toFixed(1)}% exceeds standard rep policy (10.0%) and margin is below 18.0% hurdle rate.`}
Required Approvers: **Sales Director (Vikram Mehta)** & **Finance Director (Rajesh Singhania)**.`;
        } else {
          analysis += `✅ **Policy Compliance**: Deal pricing is within authorized sales guidelines. Ready for customer signature or order conversion.`;
        }

        return {
          id: `ai-${Date.now()}`,
          sender: 'ASSISTANT',
          text: analysis,
          timestamp: new Date().toISOString(),
          confidenceScore: 98,
          sources: [
            {
              title: `Quote ${quote.quoteNumber} Live Ledger`,
              type: 'QUOTE_RISK',
              referenceId: quote.id,
              excerpt: `Subtotal: ₹ ${quote.subtotal?.toLocaleString()}, Discount: ${discount.toFixed(1)}%, Margin: ${margin.toFixed(1)}%`,
            },
            {
              title: 'Discount Governance Policy CAT-LAPTOPS-01',
              type: 'POLICY',
              excerpt: 'Discretionary ceiling: 10.0% max. Hurdle rate: 18.0% minimum gross margin.',
            }
          ],
          dataUsed: {
            quoteNumber: quote.quoteNumber,
            customer: quote.customerName,
            totalAmount: quote.totalAmount,
            discount: `${discount.toFixed(1)}%`,
            margin: `${margin.toFixed(1)}%`,
            status: quote.status,
          },
          followUpQuestions: [
            `Would you like to simulate a ${Math.max(5, discount - 4).toFixed(0)}% discount to auto-approve without VP sign-off?`,
            `Should I draft an approval escalation justification note for Vikram Mehta?`,
            `Do you want to inspect line item cost breakdown and warehouse stock?`
          ],
          suggestedActions: [
            {
              label: `Open Quote ${quote.quoteNumber}`,
              actionType: 'NAVIGATE',
              payload: { quoteId: quote.id },
              route: `/sales/quotes/${quote.id}`,
            },
            ...(approval ? [{
              label: 'Inspect Approval Chain',
              actionType: 'NAVIGATE' as const,
              payload: { approvalId: approval.id },
              route: `/approvals/${approval.id}`,
            }] : []),
            {
              label: 'Compare Negotiation Diffs',
              actionType: 'NAVIGATE',
              payload: { quoteId: quote.id },
              route: `/sales/negotiations/${quote.id}`,
            }
          ]
        };
      }
    }

    // 2. Questions about Changes / Audit Trail / What happened
    if (
      q.includes('change') ||
      q.includes('audit') ||
      q.includes('modified') ||
      q.includes('history') ||
      q.includes('revision') ||
      q.includes('who updated')
    ) {
      const changes = this.getDynamicChanges().slice(0, 4);
      const summaryText = changes.map((c, i) => 
        `${i + 1}. **${c.action}** on \`${c.entityType}\` (${c.entityId.slice(0, 8)}) by **${c.userName}** (${c.userRole})\n   *Impact*: ${c.aiImpactSummary}`
      ).join('\n\n');

      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: `**Live Change & Audit Stream (Real-Time State)**:\n\n${summaryText}\n\n*All system state diffs are cryptographically logged with immutable timestamps.*`,
        timestamp: new Date().toISOString(),
        confidenceScore: 99,
        sources: changes.map(c => ({
          title: `Audit Event: ${c.action} by ${c.userName}`,
          type: 'STOCK_AUDIT',
          referenceId: c.id,
          excerpt: c.reason || c.aiImpactSummary,
        })),
        dataUsed: { totalLoggedEvents: changes.length },
        followUpQuestions: [
          'Would you like to compare the before/after state diff of the latest quote revision?',
          'Do you want to see all changes made to a specific customer or deal?',
          'Should I scan for any pending re-approvals triggered by recent concessions?'
        ],
        suggestedActions: [
          {
            label: 'Open AI Change Monitor',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/ai-copilot',
          },
          {
            label: 'View Approvals Inbox',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/approvals',
          }
        ]
      };
    }

    // 3. Questions about Inventory, Warehouses, Stock Shortages
    if (
      q.includes('inventory') ||
      q.includes('stock') ||
      q.includes('shortage') ||
      q.includes('warehouse') ||
      q.includes('laptop') ||
      q.includes('storage') ||
      q.includes('server')
    ) {
      const shortageItems = this.stockItems.filter(s => s.quantityAvailable <= s.reorderPoint);
      const topStock = this.stockItems.slice(0, 4);

      let stockText = `**Real-Time Stock & Warehouse Inventory**:\n\n`;
      topStock.forEach(s => {
        stockText += `- **${s.productName}** (\`${s.warehouseName}\`): **${s.quantityAvailable}** Available (${s.quantityOnHand} On Hand, ${s.quantityReserved} Reserved)\n`;
      });

      if (shortageItems.length > 0) {
        stockText += `\n⚠️ **Shortage Alert**: **${shortageItems[0].productName}** in ${shortageItems[0].warehouseName} is below reorder point (${shortageItems[0].quantityAvailable} available vs ${shortageItems[0].reorderPoint} min).`;
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: stockText,
        timestamp: new Date().toISOString(),
        confidenceScore: 97,
        sources: [
          {
            title: 'Live Warehouse Stock Matrix',
            type: 'STOCK_AUDIT',
            excerpt: `${this.stockItems.length} inventory records across Mumbai, Bengaluru, Delhi, and Pune hubs.`,
          }
        ],
        dataUsed: {
          totalStockSKUs: this.stockItems.length,
          shortages: shortageItems.length,
        },
        followUpQuestions: [
          'Should I recommend the fastest vendor for procurement (Precision Silicon vs Velocity)?',
          'Would you like to initiate a warehouse transfer from Mumbai to Bengaluru?',
          'Do you want to auto-create a draft Purchase Order for stock replenishment?'
        ],
        suggestedActions: [
          {
            label: 'Inspect Stock Ledger',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/inventory/stock',
          },
          {
            label: 'Compare Sourcing Vendors',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/vendors',
          }
        ]
      };
    }

    // 4. Questions about Leads, CRM, Pipeline
    if (
      q.includes('lead') ||
      q.includes('pipeline') ||
      q.includes('crm') ||
      q.includes('hot') ||
      q.includes('prospect')
    ) {
      const hotLeads = this.leads.filter(l => l.stage === 'QUALIFIED' || l.score >= 75);
      const topLeads = this.leads.slice(0, 4);

      let leadText = `**CRM Pipeline Intelligence (${this.leads.length} Total Leads)**:\n\n`;
      leadText += `- **High-Value / Qualified Leads**: **${hotLeads.length}** ready for closing\n\n`;
      topLeads.forEach(l => {
        leadText += `- **${l.firstName} ${l.lastName}** (${l.companyName}): Score **${l.score}** (\`${l.stage}\`), Budget: ₹ ${(l.budget || 0).toLocaleString()}\n`;
      });

      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: leadText,
        timestamp: new Date().toISOString(),
        confidenceScore: 96,
        sources: [
          {
            title: 'CRM Lead Qualification & Velocity Model',
            type: 'DEAL_HEALTH',
            excerpt: 'Dynamic scoring across requirement fit, budget authority, and engagement touchpoints.',
          }
        ],
        dataUsed: {
          totalLeads: this.leads.length,
          hotLeadsCount: hotLeads.length,
        },
        followUpQuestions: [
          'Would you like to auto-generate a tailored proposal for the top lead?',
          'Should I schedule an automated follow-up reminder for new leads?',
          'Do you want to see conversion win-rate projections by lead source?'
        ],
        suggestedActions: [
          {
            label: 'View Leads Pipeline',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/crm/leads',
          },
          {
            label: 'Create New Quotation',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/sales/quotes/new',
          }
        ]
      };
    }

    // 5. Questions about Deal Health, Risk, Stalled Deals
    if (
      q.includes('risk') ||
      q.includes('health') ||
      q.includes('stalled') ||
      q.includes('deal')
    ) {
      const atRisk = this.quotes.filter(q => (q.riskAssessment?.overallScore || 0) >= 60);

      let healthText = `**Deal Health & Risk Sentinel Summary**:\n\n`;
      healthText += `Currently tracking **${atRisk.length} deals** requiring active intervention:\n\n`;
      atRisk.forEach((r, idx) => {
        healthText += `${idx + 1}. **${r.customerName} (${r.quoteNumber})**: Risk Score **${r.riskAssessment?.overallScore}** (\`${r.riskAssessment?.overallSeverity}\`) - Margin: ${r.grossMarginPercentage?.toFixed(1)}%, Total: ₹ ${(r.totalAmount || 0).toLocaleString()}\n`;
      });

      return {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: healthText,
        timestamp: new Date().toISOString(),
        confidenceScore: 97,
        sources: [
          {
            title: 'Deal Health Anomaly Detector',
            type: 'DEAL_HEALTH',
            excerpt: 'Monitors days since last touchpoint, stock availability, and margin compression.',
          }
        ],
        dataUsed: {
          atRiskCount: atRisk.length,
          totalQuotesTracked: this.quotes.length,
        },
        followUpQuestions: [
          'Would you like to simulate corrective pricing to recover deal margin above 18%?',
          'Should I notify the account executive with an action checklist for stalled deals?',
          'Do you want to reassign the lowest-health opportunity?'
        ],
        suggestedActions: [
          {
            label: 'Open Deal Health Dashboard',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/deal-health',
          },
          {
            label: 'Review Approvals',
            actionType: 'NAVIGATE',
            payload: {},
            route: '/approvals',
          }
        ]
      };
    }

    // 6. Default Dynamic Overview
    const pendingCount = this.approvals.filter(a => a.status === 'PENDING').length;
    return {
      id: `ai-${Date.now()}`,
      sender: 'ASSISTANT',
      text: `**DealFlow360 RAG Engine Ready** (Live Context Connected):

- **Active Pipeline**: ₹ 48.5M across ${this.quotes.length} quotations
- **Pending Approvals**: **${pendingCount}** awaiting manager sign-off
- **CRM Leads**: **${this.leads.length}** prospects (${this.leads.filter(l => l.score >= 80).length} High-Score)
- **Fulfillment & Stock**: ${this.stockItems.length} SKUs across 4 distribution centers

Ask me any question about deals, margin policies, inventory shortages, recent changes, or vendor comparisons!`,
      timestamp: new Date().toISOString(),
      confidenceScore: 95,
      sources: [
        {
          title: 'DealFlow360 Unified Knowledge Graph',
          type: 'POLICY',
          excerpt: 'Real-time multi-tenant data sync across CRM, Sales, Inventory, and Billing.',
        }
      ],
      dataUsed: {
        quotesCount: this.quotes.length,
        leadsCount: this.leads.length,
        stockCount: this.stockItems.length,
        pendingApprovals: pendingCount,
      },
      followUpQuestions: [
        'Why is quote Q-1024 blocked in approval?',
        'Which vendor should we use for the laptop stock deficit?',
        'What changes were recently logged in the audit trail?'
      ],
      suggestedActions: [
        {
          label: 'Open AI Copilot Hub',
          actionType: 'NAVIGATE',
          payload: {},
          route: '/ai-copilot',
        },
        {
          label: 'View Dashboard',
          actionType: 'NAVIGATE',
          payload: {},
          route: '/dashboard',
        }
      ]
    };
  }

  // --- DYNAMIC CHANGE STREAM & AUDIT EXPLAINER ---
  public getDynamicChanges(): DynamicChangeRecord[] {
    const changes: DynamicChangeRecord[] = [];

    // Collect quote revisions
    this.quotes.forEach(quote => {
      quote.revisions?.forEach((rev, idx) => {
        changes.push({
          id: `chg-${quote.id}-rev-${rev.revisionNumber || idx}`,
          action: rev.changeSummary.includes('Reapproval') ? 'REAPPROVAL_TRIGGERED' : 'QUOTE_REVISED',
          entityType: 'QUOTE',
          entityId: quote.id,
          userName: rev.createdBy,
          userRole: rev.createdByRole,
          createdAt: rev.createdAt,
          reason: rev.changeSummary,
          aiImpactSummary: rev.changeSummary.includes('Reapproval')
            ? `Margin dropped to ${rev.marginPercentage?.toFixed(1)}% (Risk Score: ${rev.riskScore}), requiring VP escalation.`
            : `Updated quotation line items to total ₹ ${rev.totalAmount?.toLocaleString()}.`,
        });
      });
    });

    // Collect approval audit trails
    this.approvals.forEach(appr => {
      appr.auditTrail?.forEach((ev, idx) => {
        changes.push({
          id: `chg-appr-${appr.id}-${idx}`,
          action: ev.action,
          entityType: 'APPROVAL',
          entityId: appr.id,
          userName: ev.performedBy,
          userRole: ev.performedByRole,
          createdAt: ev.timestamp,
          reason: ev.comments,
          aiImpactSummary: ev.action === 'APPROVED'
            ? `Authorized progression for Quote ${appr.quoteNumber} (Value: ₹ ${appr.totalAmount?.toLocaleString()}).`
            : `Approval state modified with note: "${ev.comments || 'No comment'}"`,
        });
      });
    });

    // Sort descending by timestamp
    return changes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- WHAT-IF MARGIN & INVENTORY SIMULATION ---
  public simulateWhatIf(params: {
    basePrice?: number;
    discountPercent?: number;
    unitCost?: number;
    quantity?: number;
    productId?: string;
  }): WhatIfSimulationResult {
    const basePrice = params.basePrice || 128000;
    const discountPercent = params.discountPercent ?? 15;
    const unitCost = params.unitCost || 85000;
    const quantity = params.quantity || 10;

    const unitDiscountAmount = (basePrice * discountPercent) / 100;
    const discountedUnitPrice = basePrice - unitDiscountAmount;
    const revenue = discountedUnitPrice * quantity;
    const totalCost = unitCost * quantity;
    const grossProfit = revenue - totalCost;
    const marginPercent = Number(((grossProfit / revenue) * 100).toFixed(1));

    const maxRepDiscount = 10.0;
    const hurdleMargin = 18.0;
    const requiresApproval = discountPercent > maxRepDiscount || marginPercent < hurdleMargin;

    return {
      simulationType: 'MARGIN',
      revenue,
      totalCost,
      grossProfit,
      marginPercent,
      requiresApproval,
      thresholds: {
        maxRepDiscount,
        hurdleMargin,
      },
      recommendation: requiresApproval
        ? `A ${discountPercent}% discount produces a ${marginPercent}% gross margin, which is below the corporate hurdle rate of ${hurdleMargin}%. This will trigger multi-tier approval from Sales & Finance Directors.`
        : `A ${discountPercent}% discount produces a healthy ${marginPercent}% margin (above ${hurdleMargin}% floor), eligible for instant auto-approval.`,
      followUpQuestions: [
        `Would you like to simulate with an 8.0% discount to qualify for 1-click rep approval?`,
        `Should I test bundling with high-margin software support (35% margin) to elevate overall deal margin?`
      ]
    };
  }
}

export const mockDb = new MockDatabase();
