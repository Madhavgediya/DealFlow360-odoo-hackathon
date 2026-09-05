import { CurrencyCode } from '../types/api';

const CURRENCY_CONFIG = {
  locale: 'en-IN',
  symbol: '₹',
  fractionDigits: 2,
};

export function formatCurrency(
  amount: number,
  _currency?: any,
  options?: { compact?: boolean; hideSymbol?: boolean }
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  const config = CURRENCY_CONFIG;

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

export function getCurrencySymbol(_currency?: any): string {
  return '₹';
}
