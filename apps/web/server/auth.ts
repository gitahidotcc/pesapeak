import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the server auth session
 * Used for server-side authentication checks
 */
export async function getServerAuthSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

