"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Filter, ChevronDown } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc";
import type { PeriodFilter } from "../transactions/components/period-filter-dialog";

interface Account {
    id: string;
    name: string;
    accountType: string;
    currency: string;
    color: string;
    icon: string;
    defaultAccount: boolean;
}

interface DashboardFilterDialogProps {
    periodFilter: PeriodFilter;
    onPeriodFilterChange: (filter: PeriodFilter) => void;
    selectedAccountId: string | null;
    onAccountChange: (accountId: string | null) => void;
    accounts: Account[];
    trigger?: ReactNode;
}

export function DashboardFilterDialog({
    periodFilter,
    onPeriodFilterChange,
    selectedAccountId,
    onAccountChange,
    accounts,
    trigger,
}: DashboardFilterDialogProps) {
    const [open, setOpen] = useState(false);
    // For dashboard, we currently only support Month view (\"past month by default\").

    const { data: periodsData, status: periodsStatus } = api.transactions.periods.useQuery();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    type MonthSummary = {
        year: number;
        month: number;
        transactionCount: number;
        income: number;
        expenses: number;
        netAmount: number;
    };

    const normalizedMonthSummaries = useMemo<MonthSummary[]>(() => {
        const summaries = (periodsData?.monthSummaries ?? []) as MonthSummary[];
        if (!summaries || summaries.length === 0) {
            return [];
        }
        return [...summaries].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }, [periodsData]);

    const handleMonthSelect = (year: number, month: number) => {
        onPeriodFilterChange({ type: "month", year, month });
        setOpen(false);
    };

    const getFilterSummary = () => {
        const parts: string[] = [];
        if (periodFilter.type === "month" && periodFilter.month !== undefined && periodFilter.year !== undefined) {
            const date = new Date(periodFilter.year, periodFilter.month, 1);
            parts.push(date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
        }
        return parts.join(" • ");
    };

    const isLoading = periodsStatus === "pending";
    const hasMonthData = normalizedMonthSummaries.length > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" className="flex items-center gap-2 rounded-full border-border/60 bg-background/60 px-4 py-2 text-sm shadow-sm hover:bg-background">
                        <Filter className="h-4 w-4" />
                        <span className="max-w-[200px] truncate">{getFilterSummary()}</span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md overflow-hidden rounded-[24px] border border-border/60 bg-background/95 shadow-xl">
                <DialogHeader>
                    <DialogTitle>Filter Dashboard</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Account Selector if needed, or just keep it global for now */}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Period</label>
                        <div className="max-h-[300px] overflow-y-auto rounded-xl border border-border bg-card">
                            {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}
                            {!isLoading && !hasMonthData && <div className="p-4 text-center text-sm text-muted-foreground">No data available</div>}
                            {!isLoading && hasMonthData && (
                                <div>
                                    {normalizedMonthSummaries.map((summary) => {
                                        const isSelected = periodFilter.type === 'month' && periodFilter.year === summary.year && periodFilter.month === summary.month;
                                        const isCurrent = summary.year === currentYear && summary.month === currentMonth;

                                        return (
                                            <button
                                                key={`${summary.year}-${summary.month}`}
                                                onClick={() => handleMonthSelect(summary.year, summary.month)}
                                                className={cn(
                                                    "flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted",
                                                    isSelected ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                                                )}
                                            >
                                                <span>{isCurrent ? "Current Month" : `${monthNames[summary.month]} ${summary.year}`}</span>
                                                {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
