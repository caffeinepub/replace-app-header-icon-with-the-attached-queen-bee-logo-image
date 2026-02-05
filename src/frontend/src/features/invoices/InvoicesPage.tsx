import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Pencil } from 'lucide-react';
import AsyncState from '@/components/AsyncState';
import InvoiceForm from './InvoiceForm';
import SignInRequiredState from './SignInRequiredState';
import { useInvoices, useCustomers } from './queries';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { formatCurrency } from './types';
import type { Invoice } from '@/backend';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuthStatus();
  const { data: invoices, isLoading, isError, error, refetch } = useInvoices();
  const { data: customers } = useCustomers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingInvoice(null);
  };

  const getCustomerName = (customerId: bigint) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || `Customer #${customerId}`;
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  // Show sign-in required state when not authenticated
  if (!isInitializing && !isAuthenticated) {
    return <SignInRequiredState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage your repair invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Select a customer and add line items for the repair work
              </DialogDescription>
            </DialogHeader>
            <InvoiceForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!invoices || invoices.length === 0}
        emptyMessage="No invoices yet. Create your first invoice to get started."
        emptyAction={{
          label: 'Create Invoice',
          onClick: () => setIsDialogOpen(true),
        }}
        onRetry={refetch}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              {invoices?.length || 0} invoice{invoices?.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((invoice) => (
                  <TableRow key={invoice.id.toString()}>
                    <TableCell className="font-medium">
                      INV-{invoice.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountDue)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountPaid)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.isPaid ? 'default' : 'secondary'}>
                        {invoice.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate({ to: `/invoices/${invoice.id}` })}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AsyncState>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the customer and line items for this invoice
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <InvoiceForm
              onSuccess={handleSuccess}
              initialData={editingInvoice}
              invoiceId={editingInvoice.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
