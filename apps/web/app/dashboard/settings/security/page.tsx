import { ChangePasswordForm } from "./components/change-password-form";
import { ActiveSessions } from "./components/active-sessions";
import { BackButton } from "@/components/ui/back-button";

export default async function SecurityPage() {
    return (
        <div className="space-y-6">
            <header className="space-y-2 relative pl-12">
                <BackButton
                    href="/dashboard/settings"
                    className="absolute left-0 top-0"
                    aria-label="Back to settings"
                />
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
