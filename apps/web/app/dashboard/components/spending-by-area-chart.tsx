"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface SpendingByAreaChartProps {
  data: {
    items: {
      locationName: string;
      amount: number;
      percentage: number;
      transactionCount: number;
    }[];
    totalLocatedAmount: number;
  } | undefined;
  currency?: string;
}

export function SpendingByAreaChart({ data, currency = "USD" }: SpendingByAreaChartProps) {
  const items = data?.items ?? [];
  const totalLocatedAmount = data?.totalLocatedAmount ?? 0;

  const sortedData = useMemo(() => {
    return [...items].sort((a, b) => b.amount - a.amount);
  }, [items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const maxAmount = useMemo(() => {
    if (sortedData.length === 0) return 1;
    return sortedData[0].amount;
  }, [sortedData]);

  if (items.length === 0) {
    return (
      <Card className="col-span-2 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Spending by area</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">No location data for expenses in this period</p>
            <p className="mt-1 text-xs">Add a location when recording transactions to see spending by area.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Spending by area</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((item, index) => {
            const barWidth = (item.amount / maxAmount) * 100;
            return (
              <div key={`${item.locationName}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate" title={item.locationName}>
                        {item.locationName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.transactionCount} transaction{item.transactionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap" title="% of expenses with a location this period">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500 ease-out"
                    style={{
                      width: `${barWidth}%`,
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
