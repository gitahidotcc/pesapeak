"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CreditCard, PieChart, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
    { id: "overview", name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "transactions", name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { id: "budgets", name: "Budgets", href: "/dashboard/budgets", icon: PieChart },
    { id: "settings", name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex sticky top-0",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 py-4">
                {!collapsed && (
                    <span className="text-lg font-bold tracking-tight text-sidebar-primary">
                        Pesapeak
                    </span>
                )}
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
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
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
                                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                                    !collapsed && "mr-3"
                                )}
                            />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-4">
                <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                    <ThemeSwitch />
                    {!collapsed && <span className="text-sm font-medium">Theme</span>}
                </div>
            </div>
        </aside>
    );
}
