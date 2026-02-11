import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import AsyncState from '@/components/AsyncState';
import InvoiceDocument from './InvoiceDocument';
import { useInvoice, useCustomers } from './queries';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function InvoicePrintPage() {
  const { invoiceId } = useParams({ from: '/invoices/$invoiceId/print' });
  const navigate = useNavigate();
  const id = BigInt(invoiceId);
  
  const { isAuthenticated, isInitializing } = useAuthStatus();
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);
  const { data: customers } = useCustomers();

  const customer = customers?.find((c) => c.id === invoice?.customerId) || null;
  const invoiceNumber = invoiceId.padStart(4, '0');

  // Trigger print dialog once data is loaded
  useEffect(() => {
    if (invoice && !isLoading) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, isLoading]);

  // Redirect to invoice detail if not authenticated
  if (!isInitializing && !isAuthenticated) {
    navigate({ to: '/invoices/$invoiceId', params: { invoiceId } });
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!invoice}
        emptyMessage="Invoice not found"
        onRetry={refetch}
      >
        {invoice && (
          <InvoiceDocument 
            invoice={invoice} 
            customer={customer} 
            invoiceNumber={invoiceNumber}
          />
        )}
      </AsyncState>
    </div>
  );
}
