"use client";

import { useMemo } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeExpenseChartProps {
    data: {
        date: string;
        balance: number;
        income: number;
        expenses: number;
    }[];
    currency?: string;
}

export function IncomeExpenseChart({ data, currency = "USD" }: IncomeExpenseChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            incomeValue: item.income / 100,
            expenseValue: item.expenses / 100,
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

    const getLabelName = (dataKey: string | undefined): string => {
        if (dataKey === "incomeValue") return "Income";
        if (dataKey === "expenseValue") return "Expense";
        return dataKey || "";
    };

    if (data.length === 0) {
        return (
            <Card className="col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available for this period
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-2 shadow-sm lg:col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
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
                                cursor={{ fill: "transparent" }}
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
                                                    {payload.map((entry) => (
                                                        <div key={entry.name} className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground" style={{ color: entry.color }}>
                                                                {entry.name || getLabelName(entry.dataKey)}
                                                            </span>
                                                            <span className="font-bold">
                                                                {formatCurrency(entry.value as number)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="incomeValue" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenseValue" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
