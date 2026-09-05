import { CurrencyCode } from '../types/api';

const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string; symbol: string; fractionDigits: number }> = {
  INR: { locale: 'en-IN', symbol: '₹', fractionDigits: 2 },
  USD: { locale: 'en-US', symbol: '$', fractionDigits: 2 },
  EUR: { locale: 'de-DE', symbol: '€', fractionDigits: 2 },
  GBP: { locale: 'en-GB', symbol: '£', fractionDigits: 2 },
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: { compact?: boolean; hideSymbol?: boolean }
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  if (options?.compact) {
    const formatter = new Intl.NumberFormat(config.locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    const formatted = formatter.format(amount);
    return options?.hideSymbol ? formatted : `${config.symbol} ${formatted}`;
  }

  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.fractionDigits,
    maximumFractionDigits: config.fractionDigits,
  }).format(amount);

  return options?.hideSymbol ? formatted : `${config.symbol} ${formatted}`;
}

export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
  return CURRENCY_CONFIG[currency]?.symbol || '₹';
}
