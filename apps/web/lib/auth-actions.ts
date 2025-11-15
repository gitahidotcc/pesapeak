import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current server session
 */
export async function getServerSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

/**
 * Server action for signing out
 */
export async function signOutFormAction() {
  "use server";
  const headersList = await headers();
  await auth.api.signOut({
    headers: headersList,
  });
}

