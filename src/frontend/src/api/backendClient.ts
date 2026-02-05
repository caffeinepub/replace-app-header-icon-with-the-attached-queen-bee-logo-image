import type { backendInterface } from '../backend';

export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Detect authorization/permission errors from backend traps
    if (message.includes('Unauthorized') || message.includes('Only users can')) {
      return 'You need to be signed in to access this feature. Please log in and try again.';
    }
    
    if (message.includes('Only admins can')) {
      return 'You do not have permission to perform this action. Admin access is required.';
    }
    
    if (message.includes('Can only view your own')) {
      return 'You can only view your own information.';
    }
    
    // Return the original message if it's already user-friendly
    return message;
  }
  
  if (typeof error === 'string') {
    // Handle string errors from backend traps
    if (error.includes('Unauthorized') || error.includes('Only users can')) {
      return 'You need to be signed in to access this feature. Please log in and try again.';
    }
    
    if (error.includes('Only admins can')) {
      return 'You do not have permission to perform this action. Admin access is required.';
    }
    
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export type BackendClient = backendInterface;
