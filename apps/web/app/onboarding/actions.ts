"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await auth.api.updateUser({
        headers: await headers(),
        body: {
            isOnboarded: true,
        },
    });

    redirect("/dashboard");
}
