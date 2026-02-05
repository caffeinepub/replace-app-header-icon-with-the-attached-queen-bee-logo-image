import { useInternetIdentity } from './useInternetIdentity';

/**
 * Helper hook to check if the user is authenticated (not anonymous).
 * Returns true if the user has a valid identity that is not anonymous.
 */
export function useAuthStatus() {
  const { identity, isInitializing } = useInternetIdentity();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  return {
    isAuthenticated,
    isInitializing,
    identity,
  };
}
