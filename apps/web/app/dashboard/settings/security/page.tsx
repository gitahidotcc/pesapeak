import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { ChangePasswordForm } from "./components/change-password-form";
import { ActiveSessions } from "./components/active-sessions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SecurityPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Settings
                </Link>
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                        Settings
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">Security</h1>
                    <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                        Manage your password and monitor active sessions across all your devices
                    </p>
                </div>
            </header>

            <div className="space-y-6">
                <ChangePasswordForm />
                <ActiveSessions />
            </div>
        </div>
    );
}
