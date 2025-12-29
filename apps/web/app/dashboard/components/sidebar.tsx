"use client";

import Image from "next/image";

import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";

const navigation = [
    { id: "overview", name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "transactions", name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { id: "budgets", name: "Budgets", href: "/dashboard/budgets", icon: PieChart },
    { id: "settings", name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
    user: Session["user"] | null;
}

export function Sidebar({ user }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            router.refresh();
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <aside
            className={cn(
                "hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex sticky top-0",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sidebar-accent/20">
                        <Image
                            src="/icons/logo-icon.svg"
                            alt="PesaPeak logo"
                            width={32}
                            height={32}
                            className="h-6 w-6 object-contain"
                        />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight text-sidebar-primary">
                            Pesapeak
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive =
                        pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-primary"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    isActive
                                        ? "text-sidebar-primary"
                                        : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                                    !collapsed && "mr-3"
                                )}
                            />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Account + Footer */}
            <div className="border-t border-sidebar-border p-4">
                <div
                    className={cn(
                        "flex items-center gap-3 text-sidebar-foreground",
                        collapsed ? "justify-center" : ""
                    )}
                >
                    <div className="rounded-full bg-sidebar-accent/20 p-2 text-sidebar-accent-foreground">
                        <UserCircle className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-sidebar-primary">
                                {user?.name ?? user?.email ?? "Account"}
                            </span>
                            {user?.email && (
                                <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className={cn("mt-3 flex items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
                    <div className="flex items-center gap-2">
                        <ThemeSwitch />
                        {!collapsed && (
                            <span className="text-sm font-medium text-sidebar-foreground">Theme</span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size={collapsed ? "icon" : "sm"}
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="text-sidebar-foreground hover:text-sidebar-primary"
                    >
                        <LogOut className="h-4 w-4" />
                        {!collapsed && "Sign out"}
                    </Button>
                </div>
            </div>
        </aside>
    );
}
