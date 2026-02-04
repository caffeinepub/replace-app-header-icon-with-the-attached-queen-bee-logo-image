import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateInvoice, useCustomers } from './queries';
import InvoiceLineItemsEditor from './InvoiceLineItemsEditor';
import type { InvoiceFormData, InvoiceLineItemFormData } from './types';
import { calculateInvoiceTotal, formatCurrency } from './types';

interface InvoiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const createInvoice = useCreateInvoice();
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: 0n,
    items: [{ description: '', quantity: '1', unitPrice: '0.00' }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.customerId === 0n) {
      toast.error('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    const hasEmptyItems = formData.items.some(
      (item) => !item.description.trim() || !item.quantity || !item.unitPrice
    );

    if (hasEmptyItems) {
      toast.error('Please fill in all line item fields');
      return;
    }

    try {
      await createInvoice.mutateAsync(formData);
      toast.success('Invoice created successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
    }
  };

  const total = calculateInvoiceTotal(formData.items);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer *</Label>
        {isLoadingCustomers ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading customers...
          </div>
        ) : (
          <Select
            value={formData.customerId.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, customerId: BigInt(value) })
            }
          >
            <SelectTrigger id="customer">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id.toString()} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Line Items *</Label>
        <InvoiceLineItemsEditor
          items={formData.items}
          onChange={(items) => setFormData({ ...formData, items })}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-lg font-semibold">
          Total: {formatCurrency(total)}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={createInvoice.isPending}>
            {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Invoice
          </Button>
        </div>
      </div>
    </form>
  );
}
