import type { Currency } from '../types';

const currencyConfig: Record<Currency, { symbol: string; locale: string; code: string }> = {
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
  GBP: { symbol: '£', locale: 'en-GB', code: 'GBP' },
  LYD: { symbol: 'LD', locale: 'ar-LY', code: 'LYD' },
};

export function formatCurrency(amount: number | string, currency: Currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const config = currencyConfig[currency];

  if (currency === 'LYD') {
    return `${config.symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthName(monthNum: number): string {
  const date = new Date(2024, monthNum - 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
