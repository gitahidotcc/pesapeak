import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Sidebar } from "./components/sidebar";
import { BottomNav } from "./components/bottom-nav";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // if (!session?.user?.isOnboarded) {
    //     redirect("/onboarding");
    // }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 pb-28 lg:pb-0">
                <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
            </main>
            <BottomNav />
        </div>
    );
}
