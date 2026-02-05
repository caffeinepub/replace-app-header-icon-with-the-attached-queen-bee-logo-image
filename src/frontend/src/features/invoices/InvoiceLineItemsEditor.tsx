import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { InvoiceLineItemFormData } from './types';
import type { Service } from '@/backend';
import { calculateLineTotal, formatCurrency } from './types';
import ServiceSearchSelect from './ServiceSearchSelect';

interface InvoiceLineItemsEditorProps {
  items: InvoiceLineItemFormData[];
  onChange: (items: InvoiceLineItemFormData[]) => void;
  services: Service[];
  isLoadingServices: boolean;
}

export default function InvoiceLineItemsEditor({ 
  items, 
  onChange, 
  services,
  isLoadingServices 
}: InvoiceLineItemsEditorProps) {
  const handleAddItem = () => {
    onChange([...items, { description: '', quantity: '1', unitPrice: '0.00', discount: '0' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceLineItemFormData, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    if (serviceId === 'none') {
      // Clear service selection
      const newItems = [...items];
      newItems[index] = { ...newItems[index], serviceId: undefined };
      onChange(newItems);
      return;
    }

    const service = services.find(s => s.id.toString() === serviceId);
    if (!service) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      serviceId: service.id,
      description: service.name,
      unitPrice: service.price ? (Number(service.price) / 100).toFixed(2) : newItems[index].unitPrice,
    };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Service</TableHead>
              <TableHead className="w-[22%]">Description</TableHead>
              <TableHead className="w-[10%]">Hourly</TableHead>
              <TableHead className="w-[13%]">Unit Price</TableHead>
              <TableHead className="w-[13%]">Discount %</TableHead>
              <TableHead className="w-[13%]">Total</TableHead>
              <TableHead className="w-[6%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const total = calculateLineTotal(item);
              
              return (
                <TableRow key={index}>
                  <TableCell>
                    <ServiceSearchSelect
                      value={item.serviceId}
                      onChange={(value) => handleServiceSelect(index, value)}
                      services={services}
                      disabled={isLoadingServices}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                      placeholder="e.g., Fret replacement"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleUpdateItem(index, 'discount', e.target.value)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(total)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Button type="button" variant="outline" onClick={handleAddItem} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}
