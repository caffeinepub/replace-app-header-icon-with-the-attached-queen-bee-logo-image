import { useLocation } from '@tanstack/react-router';
import BrandHeader from './BrandHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { SiX } from 'react-icons/si';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/reports/invoices') {
      return location.pathname.startsWith('/reports');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card no-print">
        <BrandHeader />
      </header>

      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex gap-1">
              <Button
                variant={isActive('/invoices') ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/invoices' })}
                className="font-medium"
              >
                Invoices
              </Button>
              <Button
                variant={isActive('/work-orders') ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/work-orders' })}
                className="font-medium"
              >
                Work Orders
              </Button>
              <Button
                variant={isActive('/customers') ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/customers' })}
                className="font-medium"
              >
                Customers
              </Button>
              <Button
                variant={isActive('/services') ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/services' })}
                className="font-medium"
              >
                Services
              </Button>
              <Button
                variant={isActive('/reports/invoices') ? 'secondary' : 'ghost'}
                onClick={() => navigate({ to: '/reports/invoices' })}
                className="font-medium"
              >
                Reports
              </Button>
            </div>
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              className="font-medium"
            >
              {text}
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-card py-6 mt-auto no-print">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Queen Bee Guitar Repair. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'queen-bee-app'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
