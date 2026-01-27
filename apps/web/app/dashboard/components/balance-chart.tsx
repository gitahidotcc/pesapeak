"use client";

import { useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceChartProps {
    data: {
        date: string;
        balance: number;
        income: number;
        expenses: number;
    }[];
    currency?: string;
}

export function BalanceChart({ data, currency = "USD" }: BalanceChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            // Convert cents to units for display
            balanceValue: item.balance / 100,
            displayDate: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));
    }, [data]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (data.length === 0) {
        return (
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Account Balance</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available for this period
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-2 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Account Balance Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="displayDate"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${currency} ${value}`}
                                width={80}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Date
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].payload.displayDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Balance
                                                        </span>
                                                        <span className="font-bold">
                                                            {formatCurrency(payload[0].value as number)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="balanceValue"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
