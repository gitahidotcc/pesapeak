"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}

export async function signInAction(email: string, password: string) {
  "use server";
  
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function signUpAction(email: string, password: string, name: string) {
  "use server";
  
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function signOutAction() {
  "use server";
  
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function signOutFormAction() {
  "use server";
  
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    
    // Redirect to sign-in page after successful sign out
    const { redirect } = await import("next/navigation");
    redirect("/auth/sign-in");
  } catch (error) {
    // In case of error, still redirect to sign-in page
    const { redirect } = await import("next/navigation");
    redirect("/auth/sign-in");
  }
}
