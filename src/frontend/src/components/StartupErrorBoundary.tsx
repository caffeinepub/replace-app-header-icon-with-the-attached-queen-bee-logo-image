import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, ChevronDown, Copy, Check } from 'lucide-react';

interface StartupErrorBoundaryProps {
  children: React.ReactNode;
}

interface StartupErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isTechnicalOpen: boolean;
  isCopied: boolean;
}

export default class StartupErrorBoundary extends React.Component<
  StartupErrorBoundaryProps,
  StartupErrorBoundaryState
> {
  constructor(props: StartupErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isTechnicalOpen: false,
      isCopied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<StartupErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Startup error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCopyDetails = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const details: string[] = [];
    details.push(`Error Message:\n${error.message}`);
    
    if (error.stack) {
      details.push(`\nStack Trace:\n${error.stack}`);
    }
    
    if (errorInfo?.componentStack) {
      details.push(`\nComponent Stack:\n${errorInfo.componentStack}`);
    }

    try {
      await navigator.clipboard.writeText(details.join('\n'));
      this.setState({ isCopied: true });
      setTimeout(() => this.setState({ isCopied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, isTechnicalOpen, isCopied } = this.state;
      const hasDetails = error?.stack || errorInfo?.componentStack;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full border-destructive">
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
              {error && (
                <div className="text-sm bg-muted p-3 rounded-md">
                  <p className="font-medium mb-2">Error Message:</p>
                  <p className="font-mono text-xs break-all">
                    {error.message}
                  </p>
                </div>
              )}
              
              {hasDetails && (
                <Collapsible 
                  open={isTechnicalOpen} 
                  onOpenChange={(open) => this.setState({ isTechnicalOpen: open })}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <ChevronDown className={`h-4 w-4 transition-transform ${isTechnicalOpen ? 'rotate-180' : ''}`} />
                      Technical details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-2">
                      {error?.stack && (
                        <div>
                          <span className="font-medium">Stack Trace:</span>
                          <pre className="mt-1 font-mono text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border max-h-48 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <span className="font-medium">Component Stack:</span>
                          <pre className="mt-1 font-mono text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border max-h-48 overflow-y-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleCopyDetails}
                      className="gap-2"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy all details
                        </>
                      )}
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
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
