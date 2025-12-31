import { useMemo } from "react";
import { createAuthClient } from "better-auth/react";
import { useClientConfig } from "./client-config";

// Factory function to create auth client with correct baseURL
function createAuthClientWithURL(baseURL: string) {
  return createAuthClient({
    baseURL,
  });
}

const defaultBaseURL = typeof window !== "undefined" 
  ? window.location.origin 
  : "http://localhost:3000";

// Default client for module-level exports (used as fallback)
export const authClient = createAuthClientWithURL(defaultBaseURL);

/**
 * Hook to get properly configured auth client
 * Uses clientConfig.publicUrl which matches server-side BETTER_AUTH_URL
 * Memoized to only recreate when config changes
 */
export function useAuthClient() {
  const config = useClientConfig();

  // Memoize the client so it only recreates when the baseURL actually changes
  // This addresses the concern about stale config while maintaining performance
  return useMemo(() => {
    const baseURL = config.publicUrl || (typeof window !== "undefined" 
      ? window.location.origin 
      : defaultBaseURL);
    
    return createAuthClientWithURL(baseURL);
  }, [config.publicUrl]);
}

export const {
  useSession,
  signIn,
  signOut,
  getSession,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
} = authClient;