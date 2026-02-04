import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AsyncState from '@/components/AsyncState';
import { useInvoice, useCustomers, useRecordPayment } from './queries';
import { formatCurrency, parseCurrency } from './types';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams({ from: '/invoices/$invoiceId' });
  const navigate = useNavigate();
  const id = BigInt(invoiceId);
  
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);
  const { data: customers } = useCustomers();
  const recordPayment = useRecordPayment();
  
  const [paymentAmount, setPaymentAmount] = useState('');

  const customer = customers?.find((c) => c.id === invoice?.customerId);

  const handleRecordPayment = async () => {
    if (!invoice) return;

    const amount = parseCurrency(paymentAmount);
    if (amount <= 0n) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const remaining = invoice.amountDue - invoice.amountPaid;
    if (amount > remaining) {
      toast.error('Payment amount cannot exceed remaining balance');
      return;
    }

    try {
      await recordPayment.mutateAsync({ invoiceId: invoice.id, amount });
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Invoice #{invoiceId.padStart(4, '0')}
          </h2>
          <p className="text-muted-foreground">View invoice details and record payments</p>
        </div>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!invoice}
        emptyMessage="Invoice not found"
        onRetry={refetch}
      >
        {invoice && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Invoice Details</CardTitle>
                    <Badge variant={invoice.isPaid ? 'default' : 'secondary'}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="text-lg font-medium">{customer?.name || 'Unknown Customer'}</p>
                    {customer && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>{customer.email}</p>
                        <p>{customer.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>{invoice.items.length} item(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Subtotal:</span>
                      <span>{formatCurrency(invoice.amountDue)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.amountDue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Due:</span>
                      <span className="font-medium">{formatCurrency(invoice.amountDue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(invoice.amountPaid)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Balance:</span>
                      <span className="font-bold">
                        {formatCurrency(invoice.amountDue - invoice.amountPaid)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!invoice.isPaid && (
                <Card>
                  <CardHeader>
                    <CardTitle>Record Payment</CardTitle>
                    <CardDescription>Enter the payment amount received</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment">Payment Amount</Label>
                      <Input
                        id="payment"
                        type="number"
                        min="0"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      onClick={handleRecordPayment}
                      disabled={recordPayment.isPending || !paymentAmount}
                      className="w-full gap-2"
                    >
                      {recordPayment.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                      Record Payment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
