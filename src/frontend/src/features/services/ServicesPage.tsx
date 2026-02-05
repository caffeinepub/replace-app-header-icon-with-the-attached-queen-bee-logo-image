import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Pencil } from 'lucide-react';
import AsyncState from '@/components/AsyncState';
import ServiceItemForm from './ServiceItemForm';
import ServiceBulkImportDialog from './ServiceBulkImportDialog';
import { useServices } from './queries';
import { formatCurrencyOptional } from './types';

export default function ServicesPage() {
  const { data: services, isLoading, isError, error, refetch } = useServices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  const handleEdit = (serviceId: bigint) => {
    navigate({ to: '/services/$serviceId', params: { serviceId: serviceId.toString() } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Manage your service catalog and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service item with description and pricing
                </DialogDescription>
              </DialogHeader>
              <ServiceItemForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ServiceBulkImportDialog 
        open={isImportDialogOpen} 
        onOpenChange={setIsImportDialogOpen}
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!services || services.length === 0}
        emptyMessage="No services yet. Add your first service to get started."
        emptyAction={{
          label: 'Add Service',
          onClick: () => setIsDialogOpen(true),
        }}
        onRetry={refetch}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              {services?.length || 0} service{services?.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service) => (
                  <TableRow key={service.id.toString()}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.serviceType || '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyOptional(service.price)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.service || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.notes || '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service.id)}
                        title="Edit service"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AsyncState>
    </div>
  );
}
