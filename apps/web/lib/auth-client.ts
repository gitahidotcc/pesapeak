import { createAuthClient } from "better-auth/react";
import serverConfig from "@pesapeak/shared/config";

export const authClient = createAuthClient({
  baseURL: serverConfig.publicUrl,
});

// Export useful hooks and methods
export const {
  useSession,
  signIn,
  signOut,
  signUp,
  getSession,
} = authClient;