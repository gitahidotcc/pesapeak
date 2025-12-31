import { createAuthClient } from "better-auth/react";
import { useClientConfig } from "./client-config";

// function to create auth client with correct baseURL
function createAuthClientWithURL(baseURL: string) {
  return createAuthClient({
    baseURL,
  });
}


const defaultBaseURL = typeof window !== "undefined" 
  ? window.location.origin 
  : "http://localhost:3000";

export const authClient = createAuthClientWithURL(defaultBaseURL);


export function useAuthClient() {
  const config = useClientConfig();

  const baseURL = config.publicUrl || (typeof window !== "undefined" 
    ? window.location.origin 
    : defaultBaseURL);
  
  return createAuthClientWithURL(baseURL);
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