import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useUpdateService } from './queries';
import { parseCurrency, formatDollars } from './types';
import { toast } from 'sonner';
import type { Service } from '@/backend';

interface ServiceEditFormProps {
  serviceId: string;
  initialData: Service;
  onSuccess?: () => void;
}

export default function ServiceEditForm({ serviceId, initialData, onSuccess }: ServiceEditFormProps) {
  const [name, setName] = useState(initialData.name);
  const [serviceType, setServiceType] = useState(initialData.serviceType || '');
  const [price, setPrice] = useState(initialData.price ? formatDollars(initialData.price) : '');
  const [service, setService] = useState(initialData.service || '');
  const [notes, setNotes] = useState(initialData.notes || '');
  const updateService = useUpdateService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a service name');
      return;
    }

    if (!price.trim()) {
      toast.error('Please enter a price');
      return;
    }

    const priceCents = parseCurrency(price);
    if (priceCents <= 0n) {
      toast.error('Price must be greater than zero');
      return;
    }

    try {
      await updateService.mutateAsync({
        serviceId,
        data: {
          name: name.trim(),
          serviceType: serviceType.trim() || undefined,
          priceCents,
          service: service.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });

      toast.success('Service updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update service');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Guitar Setup, Fret Leveling"
          disabled={updateService.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Input
          id="serviceType"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          placeholder="e.g., Maintenance, Repair, Setup"
          disabled={updateService.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="$0.00"
          disabled={updateService.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service">Service</Label>
        <Textarea
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Describe the service details..."
          rows={3}
          disabled={updateService.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          rows={2}
          disabled={updateService.isPending}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={updateService.isPending}>
          {updateService.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Service
        </Button>
      </div>
    </form>
  );
}
