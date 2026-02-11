import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, MapPin, User, Loader2, AlertCircle, Guitar, Eye } from 'lucide-react';
import { useCustomer, useCustomerWorkOrders } from './queries';
import { formatWorkOrderStatus, getStatusBadgeVariant } from '../workOrders/types';
import { useNavigate } from '@tanstack/react-router';

interface CustomerDetailDialogProps {
  customerId: bigint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailDialogProps) {
  const { data: customer, isLoading, isError, error, refetch } = useCustomer(customerId);
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useCustomerWorkOrders(customerId);
  const navigate = useNavigate();

  const handleViewWorkOrder = (workOrderId: bigint) => {
    onOpenChange(false);
    navigate({ to: `/work-orders/${workOrderId.toString()}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm text-muted-foreground">Loading customer...</p>
            </div>
          </div>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Error Loading Customer</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error?.message || 'An unexpected error occurred'}
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline" className="mt-2">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && !customer && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <User className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Customer not found</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && customer && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-base font-semibold">{customer.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base">{customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-base">{customer.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {customer.guitars && customer.guitars.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Guitar className="h-5 w-5" />
                    Guitars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customer.guitars.map((guitar, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Make</p>
                              <p className="text-base">{guitar.make || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Model</p>
                              <p className="text-base">{guitar.model || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                              <p className="text-base">{guitar.serialNumber || '—'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingWorkOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Ongoing Jobs</h3>
                      {workOrders?.ongoing && workOrders.ongoing.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Work Order ID</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrders.ongoing.map((wo) => (
                              <TableRow key={wo.id.toString()}>
                                <TableCell className="font-medium">#{wo.id.toString()}</TableCell>
                                <TableCell>{wo.description}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadgeVariant(wo.status)}>
                                    {formatWorkOrderStatus(wo.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(Number(wo.createdAt) / 1000000).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewWorkOrder(wo.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No ongoing jobs for this customer.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Completed Jobs</h3>
                      {workOrders?.completed && workOrders.completed.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Work Order ID</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrders.completed.map((wo) => (
                              <TableRow key={wo.id.toString()}>
                                <TableCell className="font-medium">#{wo.id.toString()}</TableCell>
                                <TableCell>{wo.description}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadgeVariant(wo.status)}>
                                    {formatWorkOrderStatus(wo.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(Number(wo.createdAt) / 1000000).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewWorkOrder(wo.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No completed jobs for this customer.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
