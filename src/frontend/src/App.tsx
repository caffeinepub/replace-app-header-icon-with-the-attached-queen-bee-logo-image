import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from '@/components/AppShell';
import StartupErrorBoundary from '@/components/StartupErrorBoundary';
import BootstrapGate from '@/components/BootstrapGate';
import CustomersPage from '@/features/customers/CustomersPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import InvoiceDetailPage from '@/features/invoices/InvoiceDetailPage';

const rootRoute = createRootRoute({
  component: () => (
    <StartupErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BootstrapGate>
          <AppShell>
            <Outlet />
          </AppShell>
        </BootstrapGate>
        <Toaster />
      </ThemeProvider>
    </StartupErrorBoundary>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InvoicesPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  customersRoute,
  invoicesRoute,
  invoiceDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
