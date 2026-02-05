import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AsyncState from '@/components/AsyncState';
import ServiceEditForm from './ServiceEditForm';
import { useServiceDetail } from './queries';

export default function ServiceEditPage() {
  const { serviceId } = useParams({ from: '/services/$serviceId' });
  const navigate = useNavigate();
  const { data: service, isLoading, isError, error, refetch } = useServiceDetail(serviceId);

  const handleSuccess = () => {
    navigate({ to: '/services' });
  };

  const handleBack = () => {
    navigate({ to: '/services' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Service</h2>
          <p className="text-muted-foreground">Update service details and pricing</p>
        </div>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!service}
        emptyMessage="Service not found"
        onRetry={refetch}
      >
        {service && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Make changes to the service information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceEditForm 
                serviceId={serviceId} 
                initialData={service} 
                onSuccess={handleSuccess} 
              />
            </CardContent>
          </Card>
        )}
      </AsyncState>
    </div>
  );
}
