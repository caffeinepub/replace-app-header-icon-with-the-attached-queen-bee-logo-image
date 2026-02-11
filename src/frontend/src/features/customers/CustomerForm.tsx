import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCustomer, useUpdateCustomer } from './queries';
import type { CustomerFormData } from './types';
import type { UpdatedCustomer, GuitarDetails } from '@/backend';

interface CustomerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: UpdatedCustomer;
  customerId?: bigint;
}

export default function CustomerForm({ onSuccess, onCancel, initialData, customerId }: CustomerFormProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditMode = !!customerId && !!initialData;
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    guitars: initialData?.guitars || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        guitars: initialData.guitars || [],
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a customer name');
      return;
    }

    try {
      if (isEditMode) {
        await updateCustomer.mutateAsync({ id: customerId, data: formData });
        toast.success('Customer updated successfully');
      } else {
        await createCustomer.mutateAsync(formData);
        toast.success('Customer added successfully');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'add'} customer`);
    }
  };

  const addGuitar = () => {
    setFormData({
      ...formData,
      guitars: [...formData.guitars, { make: '', model: '', serialNumber: '' }],
    });
  };

  const removeGuitar = (index: number) => {
    setFormData({
      ...formData,
      guitars: formData.guitars.filter((_, i) => i !== index),
    });
  };

  const updateGuitar = (index: number, field: keyof GuitarDetails, value: string) => {
    const updatedGuitars = [...formData.guitars];
    updatedGuitars[index] = { ...updatedGuitars[index], [field]: value };
    setFormData({ ...formData, guitars: updatedGuitars });
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, City, State 12345"
            rows={3}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Guitars</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addGuitar}>
              <Plus className="h-4 w-4 mr-1" />
              Add Guitar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.guitars.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No guitars added yet. Click "Add Guitar" to add one.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.guitars.map((guitar, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeGuitar(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-3 pr-8">
                      <div className="space-y-1.5">
                        <Label htmlFor={`make-${index}`} className="text-sm">Make</Label>
                        <Input
                          id={`make-${index}`}
                          value={guitar.make}
                          onChange={(e) => updateGuitar(index, 'make', e.target.value)}
                          placeholder="e.g., Fender, Gibson"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`model-${index}`} className="text-sm">Model</Label>
                        <Input
                          id={`model-${index}`}
                          value={guitar.model}
                          onChange={(e) => updateGuitar(index, 'model', e.target.value)}
                          placeholder="e.g., Stratocaster, Les Paul"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`serial-${index}`} className="text-sm">Serial Number</Label>
                        <Input
                          id={`serial-${index}`}
                          value={guitar.serialNumber}
                          onChange={(e) => updateGuitar(index, 'serialNumber', e.target.value)}
                          placeholder="Serial number"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
}
