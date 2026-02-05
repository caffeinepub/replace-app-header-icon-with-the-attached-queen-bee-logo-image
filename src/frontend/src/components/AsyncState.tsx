import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, AlertCircle, Inbox, ChevronDown, Copy, Check } from 'lucide-react';
import type { AppError } from '@/api/backendClient';

interface AsyncStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  children?: React.ReactNode;
}

export default function AsyncState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'No items found',
  emptyAction,
  onRetry,
  children,
}: AsyncStateProps) {
  const [isTechnicalOpen, setIsTechnicalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const appError = error as AppError | undefined;
    const hasTechnicalDetails = appError?.technicalDetails && (
      appError.technicalDetails.requestId ||
      appError.technicalDetails.canisterId ||
      appError.technicalDetails.methodName ||
      appError.technicalDetails.rawError ||
      appError.technicalDetails.stack
    );

    const handleCopyDetails = async () => {
      if (!appError?.technicalDetails) return;
      
      const details: string[] = [];
      
      if (appError.technicalDetails.requestId) {
        details.push(`Request ID: ${appError.technicalDetails.requestId}`);
      }
      if (appError.technicalDetails.canisterId) {
        details.push(`Canister ID: ${appError.technicalDetails.canisterId}`);
      }
      if (appError.technicalDetails.methodName) {
        details.push(`Method name: ${appError.technicalDetails.methodName}`);
      }
      if (appError.technicalDetails.rawError) {
        details.push(`\nRaw Error:\n${appError.technicalDetails.rawError}`);
      }
      if (appError.technicalDetails.stack) {
        details.push(`\nStack Trace:\n${appError.technicalDetails.stack}`);
      }
      
      try {
        await navigator.clipboard.writeText(details.join('\n'));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Data
          </CardTitle>
          <CardDescription>
            {error?.message || 'An unexpected error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasTechnicalDetails && (
            <Collapsible open={isTechnicalOpen} onOpenChange={setIsTechnicalOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isTechnicalOpen ? 'rotate-180' : ''}`} />
                  Technical details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-2">
                  {appError.technicalDetails?.requestId && (
                    <div>
                      <span className="font-medium">Request ID:</span>{' '}
                      <span className="font-mono text-xs">{appError.technicalDetails.requestId}</span>
                    </div>
                  )}
                  {appError.technicalDetails?.canisterId && (
                    <div>
                      <span className="font-medium">Canister ID:</span>{' '}
                      <span className="font-mono text-xs">{appError.technicalDetails.canisterId}</span>
                    </div>
                  )}
                  {appError.technicalDetails?.methodName && (
                    <div>
                      <span className="font-medium">Method name:</span>{' '}
                      <span className="font-mono text-xs">{appError.technicalDetails.methodName}</span>
                    </div>
                  )}
                  {appError.technicalDetails?.rawError && (
                    <div>
                      <span className="font-medium">Raw Error:</span>
                      <pre className="mt-1 font-mono text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border">
                        {appError.technicalDetails.rawError}
                      </pre>
                    </div>
                  )}
                  {appError.technicalDetails?.stack && (
                    <div>
                      <span className="font-medium">Stack Trace:</span>
                      <pre className="mt-1 font-mono text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border max-h-48 overflow-y-auto">
                        {appError.technicalDetails.stack}
                      </pre>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDetails}
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
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            {emptyAction && (
              <Button onClick={emptyAction.onClick} className="mt-2">
                {emptyAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
