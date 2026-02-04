import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface StartupErrorBoundaryProps {
  children: React.ReactNode;
}

interface StartupErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class StartupErrorBoundary extends React.Component<
  StartupErrorBoundaryProps,
  StartupErrorBoundaryState
> {
  constructor(props: StartupErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StartupErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Startup error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Application Error
              </CardTitle>
              <CardDescription>
                The application encountered an unexpected error during startup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <p className="font-mono text-xs break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button onClick={this.handleReload} className="w-full">
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
