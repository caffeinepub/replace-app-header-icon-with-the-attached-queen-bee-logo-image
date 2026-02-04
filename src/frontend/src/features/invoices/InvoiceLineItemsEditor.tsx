import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { InvoiceLineItemFormData } from './types';
import { calculateLineTotal, formatCurrency } from './types';

interface InvoiceLineItemsEditorProps {
  items: InvoiceLineItemFormData[];
  onChange: (items: InvoiceLineItemFormData[]) => void;
}

export default function InvoiceLineItemsEditor({ items, onChange }: InvoiceLineItemsEditorProps) {
  const handleAddItem = () => {
    onChange([...items, { description: '', quantity: '1', unitPrice: '0.00' }]);
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

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[15%]">Quantity</TableHead>
              <TableHead className="w-[20%]">Unit Price</TableHead>
              <TableHead className="w-[20%]">Total</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
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
                <TableCell className="font-medium">
                  {formatCurrency(calculateLineTotal(item))}
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
            ))}
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
