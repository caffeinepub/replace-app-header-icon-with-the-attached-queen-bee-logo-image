import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useWorkOrder, useUpdateWorkOrder, useAddWorkOrderPhoto, useRemoveWorkOrderPhoto, useCustomersForWorkOrders } from './queries';
import AsyncState from '@/components/AsyncState';
import WorkOrdersSignInRequiredState from './WorkOrdersSignInRequiredState';
import WorkOrderSheetForm from './WorkOrderSheetForm';
import WorkOrderPhotosSection from './WorkOrderPhotosSection';
import { workOrderToFormData, formatWorkOrderStatus, getStatusBadgeVariant } from './types';
import type { WorkOrderFormData } from './types';
import type { WorkOrderStatus } from '@/backend';

export default function WorkOrderDetailPage() {
  const { workOrderId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuthStatus();
  
  const workOrderIdBigInt = workOrderId ? BigInt(workOrderId) : null;
  const { data: workOrder, isLoading, isError, error, refetch } = useWorkOrder(workOrderIdBigInt);
  const { data: customers = [] } = useCustomersForWorkOrders();
  
  const updateMutation = useUpdateWorkOrder();
  const addPhotoMutation = useAddWorkOrderPhoto();
  const removePhotoMutation = useRemoveWorkOrderPhoto();

  const [formData, setFormData] = useState<WorkOrderFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data when work order loads
  if (workOrder && !formData && !isEditing) {
    setFormData(workOrderToFormData(workOrder));
  }

  if (isInitializing) {
    return <AsyncState isLoading={true} />;
  }

  if (!isAuthenticated) {
    return <WorkOrdersSignInRequiredState />;
  }

  if (isLoading) {
    return <AsyncState isLoading={true} />;
  }

  if (isError) {
    return (
      <AsyncState
        isError={true}
        error={error}
        onRetry={refetch}
      />
    );
  }

  if (!workOrder || !workOrderId) {
    return (
      <AsyncState
        isEmpty={true}
        emptyMessage="Work order not found"
        emptyAction={{
          label: 'Back to Work Orders',
          onClick: () => navigate({ to: '/work-orders' }),
        }}
      />
    );
  }

  const customer = customers.find(c => c.id === workOrder.customerId);
  const currentFormData = formData || workOrderToFormData(workOrder);

  const handleSave = async () => {
    if (!formData) return;

    try {
      await updateMutation.mutateAsync({
        id: BigInt(workOrderId),
        data: formData,
      });
      toast.success('Work order updated successfully');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update work order');
    }
  };

  const handleUploadPhoto = async (blobId: string, filename: string, contentType: string) => {
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await addPhotoMutation.mutateAsync({
      workOrderId: BigInt(workOrderId),
      photoId,
      blobId,
      filename,
      contentType,
    });
  };

  const handleRemovePhoto = async (photoId: string) => {
    await removePhotoMutation.mutateAsync({
      workOrderId: BigInt(workOrderId),
      photoId,
    });
  };

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/work-orders' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Order #{workOrderId}</h1>
            <p className="text-muted-foreground">
              {customer?.name || 'Unknown Customer'} • Created {formatDate(workOrder.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(workOrderToFormData(workOrder));
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Work Order</Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Input
                  value={currentFormData.description}
                  onChange={(e) => setFormData({ ...currentFormData, description: e.target.value })}
                />
              ) : (
                <p className="text-sm">{workOrder.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={currentFormData.status}
                  onValueChange={(value) => setFormData({ ...currentFormData, status: value as WorkOrderStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                    <SelectItem value="sent_for_approval">Sent for Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="finalized">Finalized</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                  {formatWorkOrderStatus(workOrder.status)}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentFormData.cost}
                  onChange={(e) => setFormData({ ...currentFormData, cost: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{formatCurrency(workOrder.cost)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <p className="text-sm">{customer?.name || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Repair Sheet Form */}
      {isEditing ? (
        <WorkOrderSheetForm
          formData={currentFormData}
          onChange={setFormData}
          customerName={customer?.name}
        />
      ) : (
        <WorkOrderSheetForm
          formData={workOrderToFormData(workOrder)}
          onChange={() => {}}
          customerName={customer?.name}
        />
      )}

      <Separator />

      {/* Photos Section */}
      <WorkOrderPhotosSection
        photos={workOrder.images}
        onUpload={handleUploadPhoto}
        onRemove={handleRemovePhoto}
        isUploading={addPhotoMutation.isPending}
      />
    </div>
  );
}
