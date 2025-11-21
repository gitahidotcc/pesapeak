import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";

export default async function SettingsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your account preferences and application settings
                </p>
            </header>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update your personal information
                    </p>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <input
                                type="text"
                                defaultValue={session.user.name || ""}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                type="email"
                                defaultValue={session.user.email || ""}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
                            Save Changes
                        </button>
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        Notifications
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose what notifications you receive
                    </p>

                    <div className="mt-6 space-y-4">
                        {[
                            {
                                title: "Transaction Alerts",
                                description: "Get notified when transactions are processed",
                            },
                            {
                                title: "Budget Warnings",
                                description: "Receive alerts when approaching budget limits",
                            },
                            {
                                title: "Weekly Summary",
                                description: "Get a weekly summary of your financial activity",
                            },
                            {
                                title: "Security Alerts",
                                description: "Important security and account notifications",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                                <button
                                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
                                    role="switch"
                                    aria-checked="true"
                                >
                                    <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Settings */}
                <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground">Security</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your account security
                    </p>

                    <div className="mt-6 space-y-4">
                        <button className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left hover:bg-muted">
                            <p className="font-medium text-foreground">Change Password</p>
                            <p className="text-sm text-muted-foreground">
                                Update your password regularly for security
                            </p>
                        </button>
                        <button className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left hover:bg-muted">
                            <p className="font-medium text-foreground">
                                Two-Factor Authentication
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </button>
                        <button className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left hover:bg-muted">
                            <p className="font-medium text-foreground">Active Sessions</p>
                            <p className="text-sm text-muted-foreground">
                                Manage devices where you're logged in
                            </p>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                    <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">
                        Danger Zone
                    </h2>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-500">
                        Irreversible actions that affect your account
                    </p>

                    <div className="mt-6 space-y-3">
                        <button className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-left hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:hover:bg-red-950/70">
                            <p className="font-medium text-red-900 dark:text-red-400">
                                Delete Account
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-500">
                                Permanently delete your account and all data
                            </p>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
