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
  discount: string; // Now represents percentage (0-100)
  serviceId?: bigint; // Optional service ID for UI tracking
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

export function parsePercent(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const percent = parseFloat(cleaned || '0');
  return percent;
}

export function clampPercent(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function formatPercent(value: bigint | number): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  return `${num}%`;
}

export function calculateLineTotal(item: InvoiceLineItemFormData): bigint {
  const quantity = BigInt(parseInt(item.quantity) || 0);
  const unitPrice = parseCurrency(item.unitPrice);
  const discountPercent = parsePercent(item.discount || '0');
  
  const subtotal = quantity * unitPrice;
  
  // Calculate discount amount: floor(subtotal × discountPercent / 100)
  const discountAmount = subtotal * BigInt(Math.floor(discountPercent * 100)) / 10000n;
  
  // Clamp line total to minimum of 0
  if (subtotal > discountAmount) {
    return subtotal - discountAmount;
  }
  return 0n;
}

export function calculateInvoiceSubtotal(items: InvoiceLineItemFormData[]): bigint {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0n);
}

export function calculateInvoiceTotal(items: InvoiceLineItemFormData[]): bigint {
  return calculateInvoiceSubtotal(items);
}

export interface InvoiceWithCustomer extends Invoice {
  customer?: Customer;
}

export function invoiceToFormData(invoice: Invoice): InvoiceFormData {
  return {
    customerId: invoice.customerId,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: formatCurrencyForInput(item.unitPrice),
      discount: item.discount.toString(),
    })),
  };
}

function formatCurrencyForInput(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return dollars.toFixed(2);
}

// Helper function to format invoice number with zero-padding
export function formatInvoiceNumber(id: bigint | number): string {
  const num = typeof id === 'bigint' ? Number(id) : id;
  return `INV-${num.toString().padStart(4, '0')}`;
}

// Helper function to calculate total invoice amount (amountPaid + amountDue)
export function calculateInvoiceAmount(invoice: Invoice): bigint {
  return invoice.amountPaid + invoice.amountDue;
}
