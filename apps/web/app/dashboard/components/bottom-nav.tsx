"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, CreditCard, PieChart, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { id: "overview", name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "transactions", name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    { id: "budgets", name: "Budgets", href: "/dashboard/budgets", icon: PieChart },
    { id: "settings", name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 px-6 pb-6 pt-2 backdrop-blur-lg lg:hidden">
            <div className="flex items-center justify-between">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div
                                className={cn(
                                    "flex h-10 w-16 items-center justify-center rounded-2xl transition-colors",
                                    isActive ? "bg-primary/15" : "bg-transparent group-hover:bg-muted"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-6 w-6",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
