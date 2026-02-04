import type { Invoice, InvoiceLineItem, Customer } from '../../backend';

export type { Invoice, InvoiceLineItem };

export interface InvoiceFormData {
  customerId: bigint;
  items: InvoiceLineItemFormData[];
}

export interface InvoiceLineItemFormData {
  description: string;
  quantity: string;
  unitPrice: string;
}

export function formatCurrency(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function parseCurrency(value: string): bigint {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned || '0');
  return BigInt(Math.round(dollars * 100));
}

export function calculateLineTotal(item: InvoiceLineItemFormData): bigint {
  const quantity = BigInt(parseInt(item.quantity) || 0);
  const unitPrice = parseCurrency(item.unitPrice);
  return quantity * unitPrice;
}

export function calculateInvoiceTotal(items: InvoiceLineItemFormData[]): bigint {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0n);
}

export interface InvoiceWithCustomer extends Invoice {
  customer?: Customer;
}
