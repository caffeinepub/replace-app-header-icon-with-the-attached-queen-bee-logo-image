import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Wrench, ClipboardList } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Queen Bee Guitar Repair</h1>
        <p className="text-xl text-muted-foreground">
          Manage your customers, invoices, services, and work orders all in one place
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/customers' })}>
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 mb-4">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              View and manage your customer information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/customers' })}>
              Go to Customers
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/invoices' })}>
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 mb-4">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Create and track repair invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/invoices' })}>
              Go to Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/work-orders' })}>
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 mb-4">
              <ClipboardList className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>
              Manage detailed repair work orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/work-orders' })}>
              Go to Work Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/services' })}>
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 mb-4">
              <Wrench className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Manage your service catalog and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/services' })}>
              Go to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
