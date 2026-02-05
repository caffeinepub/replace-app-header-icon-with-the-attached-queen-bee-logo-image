import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BrandHeader from '@/components/BrandHeader';
import { Users, FileText, Wrench, ClipboardList, BarChart3 } from 'lucide-react';
import { SiCaffeine } from 'react-icons/si';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrandHeader />
      
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant={currentPath.startsWith('/invoices') ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/invoices' })}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant={currentPath.startsWith('/work-orders') ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/work-orders' })}
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Work Orders
            </Button>
            <Button
              variant={currentPath.startsWith('/customers') ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/customers' })}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Customers
            </Button>
            <Button
              variant={currentPath.startsWith('/services') ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/services' })}
              className="gap-2"
            >
              <Wrench className="h-4 w-4" />
              Services
            </Button>
            <Button
              variant={currentPath.startsWith('/reports') ? 'default' : 'ghost'}
              onClick={() => navigate({ to: '/reports/invoices' })}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>© 2026. Built with</span>
            <span className="text-amber-600">♥</span>
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <SiCaffeine className="h-3 w-3" />
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
