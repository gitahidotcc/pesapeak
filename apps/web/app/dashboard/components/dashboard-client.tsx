"use client";

import { useState, useMemo } from "react";
import { api } from "@/lib/trpc";
import { DashboardFilterDialog } from "./dashboard-filter-dialog";
import { BalanceChart } from "./balance-chart";
import { IncomeExpenseChart } from "./income-expense-chart";
import { PeriodFilter } from "../transactions/components/period-filter-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

export function DashboardClient() {
    const now = new Date();
    const [filter, setFilter] = useState<PeriodFilter>({
        type: "month",
        month: now.getMonth(),
        year: now.getFullYear(),
    });
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const { data: accounts } = api.accounts.list.useQuery();
    const currency = accounts?.[0]?.currency ?? "USD";

    const dateRange = useMemo(() => {
        let startDate: Date;
        let endDate: Date;

        if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
            startDate = new Date(Date.UTC(filter.year, filter.month, 1));
            endDate = new Date(Date.UTC(filter.year, filter.month + 1, 0, 23, 59, 59));

            // Cap at today if selected month is current month
            if (filter.year === now.getFullYear() && filter.month === now.getMonth()) {
                // actually we might want to see the whole month even if empty future? 
                // The backend handles data fetching up to now. 
                // If we pass future date to backend, our logic handles it (iterating days).
            }
        } else {
            // Fallback or other modes (Year) - for now just current month default
            startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
        }

        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0]
        };
    }, [filter]);

    const { data: historyData } = api.dashboard.history.useQuery({
        accountId: selectedAccountId ?? undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
    });

    const latestBalance = useMemo(() => {
        if (!historyData?.daily || historyData.daily.length === 0) return 0;
        // The last item in the array is the most recent day (chronological)
        return historyData.daily[historyData?.daily.length - 1].balance;
    }, [historyData]);

    const formatCurrency = (amount: number) => {
        // Amount in cents
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount / 100);
    };

    const periodLabel = useMemo(() => {
        if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
            return new Date(filter.year, filter.month).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
            });
        }
        return "Selected Period";
    }, [filter]);

    // Calculations for summary cards
    // Total Income / Expense for the period
    const totalIncome = historyData?.totalIncome ?? 0;
    const totalExpenses = historyData?.totalExpenses ?? 0;

    // Filter accounts for the dropdown
    // We can pass `accounts` to the dialog.

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview for <span className="font-medium text-foreground">{periodLabel}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DashboardFilterDialog
                        periodFilter={filter}
                        onPeriodFilterChange={setFilter}
                        selectedAccountId={selectedAccountId}
                        onAccountChange={setSelectedAccountId}
                        accounts={accounts ?? []}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Balance (End of Period)
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(latestBalance)}</div>
                        <p className="text-xs text-muted-foreground">
                            {/* Optional: change vs prev period */}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Income
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-emerald-500/10 p-0.5 text-emerald-500">
                            <ArrowUpRight className="h-full w-full" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(totalIncome)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expenses
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-rose-500/10 p-0.5 text-rose-500">
                            <ArrowDownRight className="h-full w-full" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                            - {formatCurrency(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Graphs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {/* Account Balances Trend - Full Width on Mobile, or allow grid to handle */}
                <div className="md:col-span-2">
                    <BalanceChart data={historyData?.daily ?? []} currency={currency} />
                </div>

                <div className="md:col-span-2">
                    <IncomeExpenseChart data={historyData?.daily ?? []} currency={currency} />
                </div>
            </div>

        </div>
    );
}
