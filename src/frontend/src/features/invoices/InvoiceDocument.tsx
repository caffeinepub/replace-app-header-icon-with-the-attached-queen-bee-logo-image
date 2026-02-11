import { formatCurrency, formatPercent } from './types';
import { BUSINESS_ADDRESS, PAYMENT_INSTRUCTIONS, TEXT_NUMBER } from '@/config/invoiceBranding';
import { INVOICE_LOGO } from '@/config/invoiceAssets';
import type { Invoice, UpdatedCustomer } from '@/backend';

interface InvoiceDocumentProps {
  invoice: Invoice;
  customer: UpdatedCustomer | null;
  invoiceNumber: string;
}

export default function InvoiceDocument({ invoice, customer, invoiceNumber }: InvoiceDocumentProps) {
  return (
    <div className="invoice-document bg-white text-black p-8 max-w-[8.5in] mx-auto">
      {/* Header with logo and invoice info */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <img 
            src={INVOICE_LOGO.path} 
            alt={INVOICE_LOGO.alt}
            className="h-20 w-20 object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Invoice</h1>
            <p className="text-xl text-gray-600 mt-1">#{invoiceNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-block px-4 py-2 rounded text-lg font-semibold ${
            invoice.isPaid 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}>
            {invoice.isPaid ? 'PAID' : 'UNPAID'}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-300 mb-8"></div>

      {/* Business and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">From</h2>
          <div className="text-gray-900">
            <p className="font-semibold text-lg">Queen Bee Guitar Repair</p>
            <p className="text-sm mt-1 whitespace-pre-line">{BUSINESS_ADDRESS}</p>
            {TEXT_NUMBER && (
              <p className="text-sm mt-1">
                <span className="font-medium">Text:</span> {TEXT_NUMBER}
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Bill To</h2>
          <div className="text-gray-900">
            {customer ? (
              <>
                <p className="font-semibold text-lg">{customer.name}</p>
                {customer.email && <p className="text-sm mt-1">{customer.email}</p>}
                {customer.phone && <p className="text-sm">{customer.phone}</p>}
                {customer.address && <p className="text-sm mt-1">{customer.address}</p>}
              </>
            ) : (
              <p className="text-gray-500 italic">Customer information not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Description</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Hourly</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Discount</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const subtotal = item.unitPrice * item.quantity;
              const discountAmount = subtotal * item.discount / 100n;
              const total = subtotal > discountAmount ? subtotal - discountAmount : 0n;
              
              return (
                <tr key={index} className="border-b border-gray-200 page-break-inside-avoid">
                  <td className="py-3 px-2 text-gray-900">{item.description}</td>
                  <td className="py-3 px-2 text-right text-gray-900">{item.quantity.toString()}</td>
                  <td className="py-3 px-2 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-2 text-right text-gray-900">
                    {item.discount > 0n ? formatPercent(item.discount) : '—'}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900">{formatCurrency(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="border-t-2 border-gray-300 pt-4 space-y-3">
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Amount Due:</span>
              <span className="font-semibold">{formatCurrency(invoice.amountDue)}</span>
            </div>
            <div className="flex justify-between text-gray-900">
              <span className="font-medium">Amount Paid:</span>
              <span className="font-semibold text-green-700">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between text-xl">
                <span className="font-bold text-gray-900">Balance Due:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(invoice.amountDue - invoice.amountPaid)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="border-t-2 border-gray-300 pt-6 page-break-inside-avoid">
        <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Payment Instructions</h2>
        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{PAYMENT_INSTRUCTIONS}</p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-500">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
