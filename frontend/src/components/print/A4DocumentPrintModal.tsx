import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Printer, Download, CheckCircle2, ShieldCheck, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { CurrencyCode } from '../../types/api';

export interface A4DocumentLineItem {
  id: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  taxRate?: number;
  lineTotal: number;
}

export interface A4DocumentProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'INVOICE' | 'QUOTATION' | 'ORDER';
  documentNumber: string;
  status: string;
  issueDate: string;
  validUntilOrDueDate?: string;
  paymentTerms?: string;
  currency: CurrencyCode;
  
  // Company Info
  companyName?: string;
  companyGstin?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;

  // Customer Info
  customerName: string;
  customerCode?: string;
  customerGstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Financials
  lines: A4DocumentLineItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid?: number;
  amountDue?: number;

  salespersonName?: string;
  notes?: string;
}

export function A4DocumentPrintModal({
  isOpen,
  onClose,
  documentType,
  documentNumber,
  status,
  issueDate,
  validUntilOrDueDate,
  paymentTerms = 'NET_30',
  currency,
  companyName = 'DealFlow360 Enterprise Corp',
  companyGstin = '27AAACD1234F1Z9',
  companyAddress = 'Level 14, Tower B, International Financial Centre, Bandra-Kurla Complex, Mumbai, MH 400051',
  companyEmail = 'billing@dealflow360.com',
  companyPhone = '+91 (22) 6789-0000',
  customerName,
  customerCode,
  customerGstin = '27BBBCD5678G2Z4',
  billingAddress = 'Mindspace Tech Park, Linking Road, Mumbai 400064',
  shippingAddress = 'Mindspace Tech Park, Linking Road, Mumbai 400064',
  contactEmail = 'procurement@customer.com',
  contactPhone = '+91 98765 43210',
  lines,
  subtotal,
  discountTotal = 0,
  taxTotal,
  totalAmount,
  amountPaid = 0,
  amountDue = 0,
  salespersonName = 'Ananya Sharma',
  notes = 'Payment is requested via RTGS/NEFT to the designated corporate escrow account. All hardware is backed by a 3-year 24/7 on-site SLA.',
}: A4DocumentProps) {
  const isInvoice = documentType === 'INVOICE';
  const docTitle = isInvoice ? 'TAX INVOICE' : documentType === 'QUOTATION' ? 'COMMERCIAL QUOTATION' : 'SALES ORDER';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center justify-between w-full pr-6 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#714b67]" />
            <span className="font-display font-bold text-base text-[#252733]">
              A4 Print Preview — {docTitle} ({documentNumber})
            </span>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-[#714b67] hover:bg-[#5e3c54] text-white gap-2 shadow-sm font-sans"
          >
            <Printer className="w-4 h-4" />
            Print to A4 / Save PDF
          </Button>
        </div>
      }
      description="Standard enterprise formatted A4 document layout with tax compliance and signatory authorization."
    >
      {/* Scrollable Document Container */}
      <div className="max-h-[75vh] overflow-y-auto p-2 sm:p-4 bg-slate-100/60 rounded-xl border border-slate-200/80">
        {/* The Exact Printable A4 Sheet (210mm proportional box) */}
        <div className="print-document bg-white mx-auto shadow-md p-8 sm:p-12 text-[#1e293b] font-sans text-xs border border-slate-200 max-w-3xl min-h-[900px] flex flex-col justify-between">
          
          {/* HEADER SECTION */}
          <div className="space-y-6">
            <div className="flex items-start justify-between border-b-2 border-[#714b67] pb-6">
              <div className="space-y-1.5 max-w-[60%]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#714b67] text-white flex items-center justify-center font-bold text-sm font-display">
                    D
                  </div>
                  <span className="font-display font-bold text-lg text-[#252733] tracking-tight">
                    {companyName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{companyAddress}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                  <span><strong>GSTIN:</strong> {companyGstin}</span>
                  <span><strong>Email:</strong> {companyEmail}</span>
                  <span><strong>Tel:</strong> {companyPhone}</span>
                </div>
              </div>

              {/* Document Identity Block */}
              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-[#f5eff3] text-[#714b67] font-bold text-xs tracking-wider uppercase border border-[#ecdfe8]">
                  {docTitle}
                </span>
                <div className="text-base font-bold font-mono text-[#252733] pt-1">{documentNumber}</div>
                <div className="text-[11px] text-slate-500 font-mono">Date: {formatDate(issueDate)}</div>
                {validUntilOrDueDate && (
                  <div className="text-[11px] text-slate-700 font-mono">
                    <strong>{isInvoice ? 'Due Date:' : 'Valid Until:'}</strong> {formatDate(validUntilOrDueDate)}
                  </div>
                )}
                <div className="text-[10px] font-semibold text-emerald-700 uppercase pt-1">
                  Status: {status}
                </div>
              </div>
            </div>

            {/* BILL TO & SHIP TO SECTION */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Billed To (Client):</span>
                <div className="font-bold text-[#252733] text-sm">{customerName}</div>
                {customerCode && <div className="text-[10px] text-slate-400 font-mono">{customerCode}</div>}
                <p className="text-slate-600 leading-relaxed text-[11px]">{billingAddress}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                  GSTIN: {customerGstin} • Email: {contactEmail}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Commercial Terms:</span>
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Payment Terms:</span>
                  <span className="font-semibold text-[#252733] font-mono">{paymentTerms}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Account Executive:</span>
                  <span className="font-semibold text-[#252733]">{salespersonName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Currency:</span>
                  <span className="font-semibold text-[#252733] font-mono">{currency}</span>
                </div>
              </div>
            </div>

            {/* LINE ITEMS TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description & Specification</th>
                    <th className="py-2.5 px-3 text-center w-14">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Rate ({currency})</th>
                    <th className="py-2.5 px-3 text-right w-16">Disc %</th>
                    <th className="py-2.5 px-3 text-right w-16">GST</th>
                    <th className="py-2.5 px-3 text-right w-28">Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {lines.map((line, idx) => (
                    <tr key={line.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-[#252733]">{line.description}</div>
                        {line.sku && <div className="text-[10px] text-slate-400 font-mono">SKU: {line.sku}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#252733]">{line.quantity}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(line.unitPrice, currency)}</td>
                      <td className="py-3 px-3 text-right text-rose-600">{line.discountPercentage || 0}%</td>
                      <td className="py-3 px-3 text-right text-slate-500">{line.taxRate || 18}%</td>
                      <td className="py-3 px-3 text-right font-bold text-[#252733]">{formatCurrency(line.lineTotal, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL TOTALS & TAX BREAKDOWN */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="space-y-3 sm:max-w-[50%] text-[11px]">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[#252733] block text-xs">Bank Settlement Details (RTGS/NEFT):</span>
                  <div className="text-slate-600 font-mono text-[10px] space-y-0.5">
                    <div>Bank: HDFC Bank Ltd • Corporate Branch BKC</div>
                    <div>Account Name: DealFlow360 Technologies Pvt Ltd</div>
                    <div>Account No: 50200012345678 • IFSC: HDFC0000123</div>
                  </div>
                </div>

                {notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Terms & Conditions:</span>
                    <p className="text-slate-600 leading-relaxed text-[10px]">{notes}</p>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discount Deductions:</span>
                    <span>- {formatCurrency(discountTotal, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax Total (18%):</span>
                  <span>{formatCurrency(taxTotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#252733] pt-2 border-t-2 border-slate-300">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(totalAmount, currency)}</span>
                </div>
                {isInvoice && (
                  <>
                    <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-slate-200">
                      <span>Total Paid:</span>
                      <span>{formatCurrency(amountPaid, currency)}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(amountDue, currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER & AUTHORIZED SIGNATURE */}
          <div className="pt-8 mt-8 border-t border-slate-200 flex items-end justify-between text-[10px] text-slate-500">
            <div className="space-y-0.5">
              <div>This is a computer generated document validated by DealFlow360 Enterprise Engine.</div>
              <div>Registered under Indian Companies Act 2013 • CIN: U72200MH2024PTC123456</div>
            </div>

            <div className="text-center space-y-8">
              <div className="font-semibold text-slate-700">For {companyName}</div>
              <div className="border-t border-slate-400 pt-1 font-mono text-slate-600">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
