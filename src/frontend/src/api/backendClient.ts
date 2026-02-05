import type { backendInterface } from '../backend';

export interface AppError extends Error {
  userMessage: string;
  technicalDetails?: {
    requestId?: string;
    canisterId?: string;
    methodName?: string;
    rawError?: string;
    stack?: string;
  };
  errorClass?: 'stopped-canister' | 'authorization' | 'validation' | 'unknown';
}

export function createAppError(error: unknown): AppError {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Detect stopped canister errors
  if (rawMessage.includes('is stopped') || rawMessage.includes('IC0508') || rawMessage.includes('Reject code: 5')) {
    const appError = new Error('The backend canister is currently stopped. Please try again later, or restart/redeploy the canister if you manage this app.') as AppError;
    appError.userMessage = appError.message;
    appError.errorClass = 'stopped-canister';
    appError.technicalDetails = parseTechnicalDetails(rawMessage, errorStack);
    return appError;
  }
  
  // Detect authorization/permission errors from backend traps
  if (rawMessage.includes('Unauthorized') || rawMessage.includes('Only users can')) {
    const appError = new Error('You need to be signed in to access this feature. Please log in and try again.') as AppError;
    appError.userMessage = appError.message;
    appError.errorClass = 'authorization';
    appError.technicalDetails = parseTechnicalDetails(rawMessage, errorStack);
    return appError;
  }
  
  if (rawMessage.includes('Only admins can')) {
    const appError = new Error('You do not have permission to perform this action. Admin access is required.') as AppError;
    appError.userMessage = appError.message;
    appError.errorClass = 'authorization';
    appError.technicalDetails = parseTechnicalDetails(rawMessage, errorStack);
    return appError;
  }
  
  if (rawMessage.includes('Can only view your own')) {
    const appError = new Error('You can only view your own information.') as AppError;
    appError.userMessage = appError.message;
    appError.errorClass = 'authorization';
    appError.technicalDetails = parseTechnicalDetails(rawMessage, errorStack);
    return appError;
  }
  
  // Default case
  const appError = new Error(rawMessage) as AppError;
  appError.userMessage = rawMessage;
  appError.errorClass = 'unknown';
  appError.technicalDetails = parseTechnicalDetails(rawMessage, errorStack);
  return appError;
}

function parseTechnicalDetails(rawError: string, stack?: string): AppError['technicalDetails'] {
  const details: AppError['technicalDetails'] = {
    rawError,
    stack,
  };
  
  // Extract Request ID
  const requestIdMatch = rawError.match(/Request ID:\s*([a-f0-9]+)/i);
  if (requestIdMatch) {
    details.requestId = requestIdMatch[1];
  }
  
  // Extract Canister ID
  const canisterIdMatch = rawError.match(/Canister (?:ID:\s*)?([a-z0-9-]+)/i);
  if (canisterIdMatch) {
    details.canisterId = canisterIdMatch[1];
  }
  
  // Extract Method name
  const methodMatch = rawError.match(/Method name:\s*(\w+)/i);
  if (methodMatch) {
    details.methodName = methodMatch[1];
  }
  
  return details;
}

export function normalizeError(error: unknown): string {
  const appError = createAppError(error);
  return appError.userMessage;
}

export function isStoppedCanisterError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'errorClass' in error) {
    return (error as AppError).errorClass === 'stopped-canister';
  }
  return false;
}

export type BackendClient = backendInterface;
