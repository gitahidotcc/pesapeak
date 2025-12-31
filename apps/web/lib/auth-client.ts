import { createAuthClient } from "better-auth/react";


function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Server-side fallback
  return "http://localhost:3000";
}


export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

// Export useful hooks and methods
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