import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import AppShell from '@/components/AppShell';
import StartupErrorBoundary from '@/components/StartupErrorBoundary';
import BootstrapGate from '@/components/BootstrapGate';
import LandingPage from '@/features/landing/LandingPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import InvoiceDetailPage from '@/features/invoices/InvoiceDetailPage';
import InvoicePrintPage from '@/features/invoices/InvoicePrintPage';
import CustomersPage from '@/features/customers/CustomersPage';
import ServicesPage from '@/features/services/ServicesPage';
import ServiceEditPage from '@/features/services/ServiceEditPage';
import WorkOrdersPage from '@/features/workOrders/WorkOrdersPage';
import WorkOrderDetailPage from '@/features/workOrders/WorkOrderDetailPage';
import InvoicesReportPage from '@/features/reports/InvoicesReportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  component: InvoicesPage,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId',
  component: InvoiceDetailPage,
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId/print',
  component: InvoicePrintPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const serviceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/$serviceId/edit',
  component: ServiceEditPage,
});

const workOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/work-orders',
  component: WorkOrdersPage,
});

const workOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/work-orders/$workOrderId',
  component: WorkOrderDetailPage,
});

const reportsInvoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/invoices',
  component: InvoicesReportPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  invoicesRoute,
  invoiceDetailRoute,
  invoicePrintRoute,
  customersRoute,
  servicesRoute,
  serviceEditRoute,
  workOrdersRoute,
  workOrderDetailRoute,
  reportsInvoicesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <StartupErrorBoundary>
        <BootstrapGate>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
          </QueryClientProvider>
        </BootstrapGate>
      </StartupErrorBoundary>
    </StrictMode>
  );
}
