import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import AsyncState from '@/components/AsyncState';

interface BootstrapGateProps {
  children: React.ReactNode;
}

export default function BootstrapGate({ children }: BootstrapGateProps) {
  const { isInitializing, isLoginError, loginError } = useInternetIdentity();

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <AsyncState
        isLoading={true}
      />
    );
  }

  // Show error state if login failed
  if (isLoginError) {
    return (
      <AsyncState
        isError={true}
        error={loginError || new Error('Failed to initialize authentication system. Please check your connection and try again.')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Render children for all other states (idle, logging-in, success)
  return <>{children}</>;
}
