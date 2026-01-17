"use client";

import { useMemo } from "react";
import {
    Banknote,
    Wallet,
    CreditCard,
    PiggyBank,
    Coins,
    Landmark,
    Building,
    Building2,
    Home,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Euro,
    Bitcoin,
    Smartphone,
    Car,
    Plane,
    Gift,
    Heart,
    type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ICON_MAP: Record<string, LucideIcon> = {
    banknote: Banknote,
    wallet: Wallet,
    "credit-card": CreditCard,
    "piggy-bank": PiggyBank,
    coins: Coins,
    landmark: Landmark,
    building: Building,
    "building-2": Building2,
    home: Home,
    briefcase: Briefcase,
    "shopping-cart": ShoppingCart,
    "trending-up": TrendingUp,
    "dollar-sign": DollarSign,
    euro: Euro,
    bitcoin: Bitcoin,
    smartphone: Smartphone,
    car: Car,
    plane: Plane,
    gift: Gift,
    heart: Heart,
};

interface ExpenseCategoryChartProps {
    data: {
        categoryId: string | null;
        categoryName: string;
        categoryIcon: string | null;
        categoryColor: string | null;
        folderName: string | null;
        amount: number;
        percentage: number;
    }[];
    currency?: string;
}

export function ExpenseCategoryChart({ data, currency = "USD" }: ExpenseCategoryChartProps) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.amount - a.amount);
    }, [data]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value / 100);
    };

    const getCategoryIcon = (iconName: string | null) => {
        if (!iconName) return Banknote;
        const Icon = ICON_MAP[iconName] || Banknote;
        return Icon;
    };

    const maxAmount = useMemo(() => {
        if (sortedData.length === 0) return 1;
        return sortedData[0].amount;
    }, [sortedData]);

    if (data.length === 0) {
        return (
            <Card className="col-span-2 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <p className="text-sm">No expense data available for this period</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-2 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedData.map((item, index) => {
                        const Icon = getCategoryIcon(item.categoryIcon);
                        const categoryColor = item.categoryColor || "#888888";
                        const barWidth = (item.amount / maxAmount) * 100;
                        return (
                            <div key={item.categoryId || `uncategorized-${index}`} className="space-y-2">
                                {/* Category Header */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: `${categoryColor}20`,
                                                color: categoryColor,
                                            }}
                                        >
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {item.folderName ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground leading-tight">
                                                        {item.folderName}
                                                    </span>
                                                    <span className="text-sm font-medium text-foreground leading-tight truncate">
                                                        {item.categoryName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {item.categoryName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                                            {formatCurrency(item.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                                            {item.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${barWidth}%`,
                                            backgroundColor: categoryColor,
                                            minWidth: barWidth > 0 ? "2px" : "0",
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
