import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateInvoice, useUpdateInvoice, useCustomers } from './queries';
import { useServices } from '../services/queries';
import InvoiceLineItemsEditor from './InvoiceLineItemsEditor';
import type { InvoiceFormData, InvoiceLineItemFormData } from './types';
import type { Invoice } from '@/backend';
import { 
  calculateInvoiceTotal, 
  formatCurrency,
  parsePercent,
  clampPercent
} from './types';

interface InvoiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Invoice;
  invoiceId?: bigint;
}

export default function InvoiceForm({ onSuccess, onCancel, initialData, invoiceId }: InvoiceFormProps) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
  const { data: services, isLoading: isLoadingServices } = useServices();
  const isEditMode = !!invoiceId && !!initialData;
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: initialData?.customerId || 0n,
    items: initialData?.items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: (Number(item.unitPrice) / 100).toFixed(2),
      discount: item.discount.toString(),
    })) || [{ description: '', quantity: '1', unitPrice: '0.00', discount: '0' }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerId: initialData.customerId,
        items: initialData.items.map((item) => ({
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: (Number(item.unitPrice) / 100).toFixed(2),
          discount: item.discount.toString(),
        })),
      });
    }
  }, [initialData]);

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

    // Validate that discount percentages are within 0-100 range
    const hasInvalidDiscount = formData.items.some((item) => {
      const discountPercent = parsePercent(item.discount || '0');
      return discountPercent < 0 || discountPercent > 100;
    });

    if (hasInvalidDiscount) {
      toast.error('Discount percentage must be between 0 and 100');
      return;
    }

    try {
      if (isEditMode) {
        await updateInvoice.mutateAsync({ id: invoiceId, data: formData });
        toast.success('Invoice updated successfully');
      } else {
        await createInvoice.mutateAsync(formData);
        toast.success('Invoice created successfully');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} invoice`);
    }
  };

  const total = calculateInvoiceTotal(formData.items);
  const isPending = createInvoice.isPending || updateInvoice.isPending;

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
          services={services || []}
          isLoadingServices={isLoadingServices}
        />
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
