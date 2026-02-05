export interface ServiceFormData {
  name: string;
  serviceType?: string;
  priceCents?: bigint;
  service?: string;
  notes?: string;
}

export interface ImportPreviewRow {
  rowIndex: number;
  name: string;
  serviceType: string;
  priceString: string;
  priceCents: bigint;
  service: string;
  notes: string;
  isValid: boolean;
  errorMessage?: string;
}

export function parseCurrency(value: string): bigint {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned || '0');
  return BigInt(Math.round(dollars * 100));
}

export function formatCurrency(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function formatCurrencyOptional(cents: bigint | undefined): string {
  if (cents === undefined) {
    return '—';
  }
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function formatDollars(cents: bigint): string {
  return (Number(cents) / 100).toFixed(2);
}
