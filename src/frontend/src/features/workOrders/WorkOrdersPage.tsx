import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useWorkOrders } from './queries';
import AsyncState from '@/components/AsyncState';
import WorkOrdersSignInRequiredState from './WorkOrdersSignInRequiredState';
import WorkOrderCreateDialog from './WorkOrderCreateDialog';
import { formatWorkOrderStatus, getStatusBadgeVariant } from './types';

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuthStatus();
  const { data: workOrders = [], isLoading, isError, error, refetch } = useWorkOrders();

  if (isInitializing) {
    return <AsyncState isLoading={true} />;
  }

  if (!isAuthenticated) {
    return <WorkOrdersSignInRequiredState />;
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">Manage guitar repair work orders</p>
        </div>
        <WorkOrderCreateDialog />
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={workOrders.length === 0}
        emptyMessage="No work orders found. Create your first work order to get started."
        onRetry={refetch}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Work Orders</CardTitle>
            <CardDescription>View and manage all work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id.toString()}>
                    <TableCell className="font-medium">#{workOrder.id.toString()}</TableCell>
                    <TableCell>{workOrder.customerName}</TableCell>
                    <TableCell className="max-w-xs truncate">{workOrder.description}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                        {formatWorkOrderStatus(workOrder.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(workOrder.cost)}</TableCell>
                    <TableCell>{formatDate(workOrder.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: `/work-orders/${workOrder.id.toString()}` })}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
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
