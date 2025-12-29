import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import {
    CreditCard,
    Tag,
    Hash,
    UserCircle,
    Shield,
    LogOut,
    Settings,
    ChevronRight,
} from "lucide-react";

const sections = [
    {
        id: "personal",
        title: "Personal",
        items: [
            {
                label: "Profile",
                description: "Name, email, contact preferences.",
                href: "/dashboard/settings/profile",
                icon: UserCircle,
            },
            {
                label: "Security",
                description: "Password, MFA, and active sessions.",
                href: "/dashboard/settings/security",
                icon: Shield,
            },
        ],
    },
            {
                id: "general",
                title: "General",
                items: [
                    {
                        label: "Manage Accounts",
                        description: "Add connected accounts, edit balances.",
                        href: "/dashboard/settings/accounts",
                        icon: CreditCard,
                    },
                    {
                        label: "Categories",
                        description: "Organize your budgets by category.",
                        href: "/dashboard/settings/categories",
                        icon: Tag,
                    },
                    {
                        label: "Tags",
                        description: "Color-code and filter transactions.",
                        href: "/dashboard/settings/tags",
                        icon: Hash,
                    },
                    {
                        label: "App Preferences",
                        description: "Notifications, currency, and locale.",
                        href: "/dashboard/settings/preferences",
                        icon: Settings,
                    },
                ],
            },
];

export default async function SettingsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-3xl font-semibold text-white">Settings</p>
            </header>

            <div className="space-y-6">
                {sections.map((section) => (
                    <section
                        key={section.id}
                        className="space-y-3 rounded-3xl border border-border bg-muted/20 px-4 py-4 backdrop-blur"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            {section.title}
                        </p>

                        <div className="space-y-3">
                            {section.items.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-background/90 to-muted/40 px-4 py-4 transition hover:bg-primary/10"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary/20">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-semibold text-foreground">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
