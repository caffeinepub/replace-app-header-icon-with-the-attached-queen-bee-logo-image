import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, User, Loader2, AlertCircle } from 'lucide-react';
import { useCustomer } from './queries';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
              <CardContent className="pt-6">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
