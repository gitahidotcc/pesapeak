"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

interface TagAnalyticsChartProps {
    dateRange: { startDate: string; endDate: string };
    accountId?: string | null;
    currency: string;
}

export function TagAnalyticsChart({ dateRange, accountId, currency }: TagAnalyticsChartProps) {
    const { data: analytics, isLoading } = api.tags.getAnalytics.useQuery({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        accountId: accountId ?? undefined,
    });

    const totalSpending = useMemo(() => {
        return analytics?.reduce((acc, curr) => acc + curr.totalAmount, 0) ?? 0;
    }, [analytics]);

    if (isLoading) {
        return <Skeleton className="h-[300px] w-full rounded-xl" />;
    }

    if (!analytics || analytics.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Tag</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                        No tag data available for this period
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Determine max value for bar scaling
    const maxAmount = Math.max(...analytics.map((item) => item.totalAmount));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending by Tag</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {analytics.map((item) => {
                        const percentage = ((item.totalAmount / totalSpending) * 100).toFixed(1);
                        const widthPercentage = (item.totalAmount / maxAmount) * 100;

                        return (
                            <div key={item.tagId} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.tagName}</span>
                                        <span className="text-muted-foreground text-xs">
                                            ({item.count} txns)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-xs">{percentage}%</span>
                                        <span className="font-medium">
                                            {formatCurrency(item.totalAmount, currency)}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${widthPercentage}%` }}
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
