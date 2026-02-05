import { useMemo, useState } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useInvoices, useCustomers } from '@/features/invoices/queries';
import SignInRequiredState from '@/features/invoices/SignInRequiredState';
import AsyncState from '@/components/AsyncState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatInvoiceNumber, calculateInvoiceAmount } from '@/features/invoices/types';
import InvoicesReportFilters from './InvoicesReportFilters';
import { isInvoiceInDateRange } from './invoiceReportDateUtils';
import type { Invoice, Customer } from '@/backend';

type FilterType = 'all' | 'paid' | 'unpaid';

export default function InvoicesReportPage() {
  const { isAuthenticated, isInitializing } = useAuthStatus();
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useInvoices();

  const {
    data: customers,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers();

  // Show sign-in required state when not authenticated
  if (!isInitializing && !isAuthenticated) {
    return <SignInRequiredState />;
  }

  // Show loading/error states
  if (invoicesLoading || customersLoading || isInitializing) {
    return <AsyncState isLoading={true} />;
  }

  if (invoicesError) {
    return (
      <AsyncState
        isError={true}
        error={invoicesError instanceof Error ? invoicesError : new Error('Failed to load invoices')}
        onRetry={refetchInvoices}
      />
    );
  }

  if (customersError) {
    return (
      <AsyncState
        isError={true}
        error={customersError instanceof Error ? customersError : new Error('Failed to load customers')}
      />
    );
  }

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSelectedCustomerId('all');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <InvoicesReportContent
      invoices={invoices || []}
      customers={customers || []}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      selectedCustomerId={selectedCustomerId}
      setSelectedCustomerId={setSelectedCustomerId}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      onClearFilters={handleClearFilters}
    />
  );
}

interface InvoicesReportContentProps {
  invoices: Invoice[];
  customers: Customer[];
  statusFilter: FilterType;
  setStatusFilter: (filter: FilterType) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  onClearFilters: () => void;
}

function InvoicesReportContent({
  invoices,
  customers,
  statusFilter,
  setStatusFilter,
  selectedCustomerId,
  setSelectedCustomerId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClearFilters,
}: InvoicesReportContentProps) {
  // Create customer lookup map
  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((customer) => {
      map.set(customer.id.toString(), customer);
    });
    return map;
  }, [customers]);

  // Apply all filters together
  const filteredInvoices = useMemo(() => {
    let result = invoices;

    // Filter by payment status
    if (statusFilter === 'paid') {
      result = result.filter((inv) => inv.isPaid);
    } else if (statusFilter === 'unpaid') {
      result = result.filter((inv) => !inv.isPaid);
    }

    // Filter by customer
    if (selectedCustomerId !== 'all') {
      result = result.filter((inv) => inv.customerId.toString() === selectedCustomerId);
    }

    // Filter by date range
    if (startDate || endDate) {
      result = result.filter((inv) => isInvoiceInDateRange(inv.createdAt, startDate, endDate));
    }

    return result;
  }, [invoices, statusFilter, selectedCustomerId, startDate, endDate]);

  // Calculate summary statistics from filtered invoices
  const summary = useMemo(() => {
    const count = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((sum, invoice) => {
      return sum + calculateInvoiceAmount(invoice);
    }, 0n);
    return { count, totalAmount };
  }, [filteredInvoices]);

  // Helper to get customer name with fallback
  const getCustomerName = (customerId: bigint): string => {
    const customer = customerMap.get(customerId.toString());
    return customer ? customer.name : `Customer #${customerId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices Report</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze all invoices with payment status and amounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Invoice Summary</CardTitle>
              <CardDescription>Filter and view invoice details</CardDescription>
            </div>
            <InvoicesReportFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={setSelectedCustomerId}
              customers={customers}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClearFilters={onClearFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold">{summary.count}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No invoices match the current filters. Try adjusting your filter criteria.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const invoiceAmount = calculateInvoiceAmount(invoice);
                    return (
                      <TableRow key={invoice.id.toString()}>
                        <TableCell className="font-medium">
                          {formatInvoiceNumber(invoice.id)}
                        </TableCell>
                        <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.isPaid ? 'default' : 'secondary'}>
                            {invoice.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoiceAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
