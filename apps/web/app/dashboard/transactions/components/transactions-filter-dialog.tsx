"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Filter, Calendar, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PeriodFilter } from "./period-filter-dialog";
import { api } from "@/lib/trpc";

interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  color: string;
  icon: string;
  defaultAccount: boolean;
}

interface TransactionsFilterDialogProps {
  periodFilter: PeriodFilter;
  onPeriodFilterChange: (filter: PeriodFilter) => void;
  selectedAccountId: string | null;
  onAccountChange: (accountId: string | null) => void;
  accounts: Account[];
  trigger?: ReactNode;
}

export function TransactionsFilterDialog({
  periodFilter,
  onPeriodFilterChange,
  selectedAccountId,
  onAccountChange,
  accounts,
  trigger,
}: TransactionsFilterDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: periodsData, status: periodsStatus } = api.transactions.periods.useQuery();

  const hasActiveFilters = periodFilter.type !== "all" || selectedAccountId !== null;

  const currency = accounts?.[0]?.currency ?? "USD";
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

    const sorted = [...summaries].sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });

    return sorted;
  }, [periodsData]);

  const monthsByYear = useMemo(() => {
    const map: Record<number, MonthSummary[]> = {};

    normalizedMonthSummaries.forEach((summary) => {
      if (!map[summary.year]) {
        map[summary.year] = [];
      }
      map[summary.year].push(summary);
    });

    // Sort months within each year from most recent (Dec) to earliest (Jan)
    Object.keys(map).forEach((yearKey) => {
      const year = Number(yearKey);
      map[year] = map[year].sort((a, b) => b.month - a.month);
    });

    return map;
  }, [normalizedMonthSummaries]);

  const formatAmount = (amount: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(amount / 100);
    } catch {
      return `${currency} ${(amount / 100).toFixed(2)}`;
    }
  };

  const handleClearAll = () => {
    const nowDate = new Date();
    onPeriodFilterChange({
      type: "month",
      month: nowDate.getMonth(),
      year: nowDate.getFullYear(),
    });
    onAccountChange(null);
  };

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

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border-border/60 bg-background/60 px-4 py-2 text-sm shadow-sm hover:bg-background"
          >
            <Filter className="h-4 w-4" />
            <span className="max-w-[200px] truncate">{getFilterSummary()}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] max-h-[85vh] overflow-hidden rounded-[24px] border border-border/60 bg-background/95 shadow-xl sm:h-[75vh]">
        <div className="flex h-full flex-col gap-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Filter Transactions
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  handleClearAll();
                  setOpen(false);
                }}
                disabled={!hasActiveFilters}
              >
                Clear all
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{getFilterSummary()}</p>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between px-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-sm font-semibold text-foreground">
                <Calendar className="h-4 w-4" />
                <span>Month</span>
              </div>
                <div className="text-xs text-muted-foreground">Choose a month</div>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-1">
              <div className="h-full overflow-y-auto">
                {periodsStatus === "pending" ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading months...
                  </div>
                ) : Object.keys(monthsByYear).length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  Object.keys(monthsByYear)
                    .map(Number)
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <div key={year} className="pb-3">
                        <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {year}
                        </div>
                        <div className="mt-2 space-y-2">
                          {monthsByYear[year]?.map((summary) => {
                            const isSelected =
                              periodFilter.type === "month" &&
                              periodFilter.year === summary.year &&
                              periodFilter.month === summary.month;
                            const isCurrent =
                              summary.year === currentYear && summary.month === currentMonth;
                            const amountPill =
                              summary.netAmount >= 0
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400";
                            const amountLabel = formatAmount(summary.netAmount);
                            return (
                              <button
                                key={`${summary.year}-${summary.month}`}
                                type="button"
                                onClick={() => handleMonthSelect(summary.year, summary.month)}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card hover:bg-muted"
                                )}
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="text-base font-semibold">
                                    {isCurrent
                                      ? "Current Month"
                                      : `${monthNames[summary.month]} ${summary.year}`}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {summary.transactionCount}{" "}
                                    {summary.transactionCount === 1
                                      ? "transaction"
                                      : "transactions"}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-sm font-semibold",
                                    amountPill
                                  )}
                                >
                                  {amountLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

