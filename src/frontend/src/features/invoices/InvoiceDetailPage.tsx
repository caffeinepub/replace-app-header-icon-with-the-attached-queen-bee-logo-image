import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, DollarSign, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import AsyncState from '@/components/AsyncState';
import SignInRequiredState from './SignInRequiredState';
import InvoiceForm from './InvoiceForm';
import { useInvoice, useCustomers, useRecordPayment, useAddInvoicePhoto, useRemoveInvoicePhoto } from './queries';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatCurrency, parseCurrency, formatPercent } from './types';
import { BUSINESS_ADDRESS, PAYMENT_INSTRUCTIONS, TEXT_NUMBER } from '@/config/invoiceBranding';
import { INVOICE_LOGO } from '@/config/invoiceAssets';
import InvoicePhotosSection from './InvoicePhotosSection';
import type { Invoice } from '@/backend';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams({ from: '/invoices/$invoiceId' });
  const navigate = useNavigate();
  const id = BigInt(invoiceId);
  
  const { isAuthenticated, isInitializing } = useAuthStatus();
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);
  const { data: customers } = useCustomers();
  const recordPayment = useRecordPayment();
  const addPhoto = useAddInvoicePhoto();
  const removePhoto = useRemoveInvoicePhoto();
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleUploadPhoto = (isBefore: boolean) => {
    return async (blobId: string, filename: string, contentType: string) => {
      if (!invoice) return;
      
      const photoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await addPhoto.mutateAsync({
        invoiceId: invoice.id,
        photoId,
        isBefore,
        blobId,
        filename,
        contentType,
      });
    };
  };

  const handleRemovePhoto = (isBefore: boolean) => {
    return async (photoId: string) => {
      if (!invoice) return;
      
      await removePhoto.mutateAsync({
        invoiceId: invoice.id,
        photoId,
        isBefore,
      });
    };
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  // Show sign-in required state when not authenticated
  if (!isInitializing && !isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img 
            src={INVOICE_LOGO.path} 
            alt={INVOICE_LOGO.alt}
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Invoice #{invoiceId.padStart(4, '0')}
            </h2>
            <p className="text-muted-foreground">View invoice details and record payments</p>
          </div>
        </div>
        <SignInRequiredState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img 
            src={INVOICE_LOGO.path} 
            alt={INVOICE_LOGO.alt}
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Invoice #{invoiceId.padStart(4, '0')}
            </h2>
            <p className="text-muted-foreground">View invoice details and record payments</p>
          </div>
        </div>
        {invoice && (
          <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Invoice
          </Button>
        )}
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

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground">Business Address</Label>
                    <p className="text-sm mt-1">{BUSINESS_ADDRESS}</p>
                    {TEXT_NUMBER && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Text:</span> {TEXT_NUMBER}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>{invoice.items.length} item(s)</CardDescription>
                </CardHeader>
                <CardContent className="invoice-watermark-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hourly</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Discount %</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => {
                        const subtotal = item.unitPrice * item.quantity;
                        // Calculate discount amount using percentage: floor(subtotal × discount / 100)
                        const discountAmount = subtotal * item.discount / 100n;
                        const total = subtotal > discountAmount ? subtotal - discountAmount : 0n;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.discount > 0n ? formatPercent(item.discount) : '—'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(total)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.amountDue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <InvoicePhotosSection
                title="Before Photos"
                description="Photos taken before the repair work"
                photos={invoice.beforePhotos}
                onUpload={handleUploadPhoto(true)}
                onRemove={handleRemovePhoto(true)}
                isUploading={addPhoto.isPending}
              />

              <InvoicePhotosSection
                title="After Photos"
                description="Photos taken after the repair work"
                photos={invoice.afterPhotos}
                onUpload={handleUploadPhoto(false)}
                onRemove={handleRemovePhoto(false)}
                isUploading={addPhoto.isPending}
              />
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

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground text-xs">Payment Instructions</Label>
                    <p className="text-sm mt-2 leading-relaxed">{PAYMENT_INSTRUCTIONS}</p>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the customer and line items for this invoice
            </DialogDescription>
          </DialogHeader>
          {invoice && (
            <InvoiceForm
              onSuccess={handleEditSuccess}
              initialData={invoice}
              invoiceId={invoice.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
