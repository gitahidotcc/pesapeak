"use client";

import { useState, useMemo } from "react";
import { Filter, Calendar, Wallet, ChevronDown, Check, type LucideIcon } from "lucide-react";
import {
  Banknote,
  CreditCard,
  Coins,
  PiggyBank,
} from "lucide-react";
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

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
};

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
  availableMonths: Array<{ year: number; month: number }>;
  availableYears: number[];
}

type FilterTab = "period" | "account";

export function TransactionsFilterDialog({
  periodFilter,
  onPeriodFilterChange,
  selectedAccountId,
  onAccountChange,
  accounts,
  availableMonths,
  availableYears,
}: TransactionsFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("period");

  const hasActiveFilters = periodFilter.type !== "all" || selectedAccountId !== null;

  const selectedAccount = selectedAccountId
    ? accounts.find((acc) => acc.id === selectedAccountId)
    : null;

  const monthsByYear = useMemo(() => {
    const grouped: Record<number, number[]> = {};
    availableMonths.forEach(({ year, month }) => {
      if (!grouped[year]) {
        grouped[year] = [];
      }
      if (!grouped[year].includes(month)) {
        grouped[year].push(month);
      }
    });
    Object.keys(grouped).forEach((year) => {
      grouped[Number(year)].sort((a, b) => b - a);
    });
    return grouped;
  }, [availableMonths]);

  const sortedYears = useMemo(() => {
    return [...availableYears].sort((a, b) => b - a);
  }, [availableYears]);

  const handleClearAll = () => {
    onPeriodFilterChange({ type: "all" });
    onAccountChange(null);
  };

  const getFilterSummary = () => {
    const parts: string[] = [];
    
    if (periodFilter.type === "month" && periodFilter.month !== undefined && periodFilter.year !== undefined) {
      const date = new Date(periodFilter.year, periodFilter.month, 1);
      parts.push(date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
    } else if (periodFilter.type === "year" && periodFilter.year !== undefined) {
      parts.push(periodFilter.year.toString());
    } else if (periodFilter.type === "range" && periodFilter.startDate && periodFilter.endDate) {
      const start = new Date(periodFilter.startDate);
      const end = new Date(periodFilter.endDate);
      parts.push(`${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
    } else if (periodFilter.type === "all") {
      parts.push("All time");
    }

    if (selectedAccount) {
      parts.push(selectedAccount.name);
    } else {
      parts.push("All accounts");
    }

    return parts.join(" • ");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full border-border/60 bg-background/60 px-4 py-2 text-sm shadow-sm hover:bg-background"
        >
          <Filter className="h-4 w-4" />
          <span className="max-w-[200px] truncate">{getFilterSummary()}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-2xl border border-border/60 bg-background/95 shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Filter Transactions
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearAll}
              disabled={!hasActiveFilters}
            >
              Clear all
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Tabs */}
          <div className="inline-flex w-full rounded-2xl border border-border/60 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("period")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === "period"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Period</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === "account"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Account</span>
              </div>
            </button>
          </div>

          {/* Period Tab */}
          {activeTab === "period" && (
            <div className="space-y-4">
              <div className="inline-flex w-full rounded-2xl border border-border/60 bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => onPeriodFilterChange({ type: "all" })}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    periodFilter.type === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    onPeriodFilterChange({
                      type: "month",
                      month: now.getMonth(),
                      year: now.getFullYear(),
                    });
                  }}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    periodFilter.type === "month"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    onPeriodFilterChange({
                      type: "year",
                      year: now.getFullYear(),
                    });
                  }}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    periodFilter.type === "year"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Year
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (periodFilter.type !== "range") {
                      const now = new Date();
                      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                      onPeriodFilterChange({
                        type: "range",
                        startDate: startOfMonth.toISOString().split("T")[0],
                        endDate: endOfMonth.toISOString().split("T")[0],
                      });
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    periodFilter.type === "range"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Range
                </button>
              </div>

              {periodFilter.type === "month" && (
                <div className="max-h-[400px] space-y-4 overflow-y-auto">
                  {Object.keys(monthsByYear).length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No transactions found
                    </div>
                  ) : (
                    Object.entries(monthsByYear)
                      .sort((a, b) => Number(b[0]) - Number(a[0]))
                      .map(([year, months]) => (
                        <div key={year} className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {year}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {months.map((month) => {
                              const isSelected =
                                periodFilter.type === "month" &&
                                periodFilter.month === month &&
                                periodFilter.year === Number(year);
                              return (
                                <button
                                  key={month}
                                  type="button"
                                  onClick={() => {
                                    onPeriodFilterChange({
                                      type: "month",
                                      month,
                                      year: Number(year),
                                    });
                                  }}
                                  className={cn(
                                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                                    isSelected
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border bg-background hover:bg-muted"
                                  )}
                                >
                                  {monthNames[month]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {periodFilter.type === "year" && (
                <div className="max-h-[400px] space-y-2 overflow-y-auto">
                  {sortedYears.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No transactions found
                    </div>
                  ) : (
                    sortedYears.map((year) => {
                      const isSelected = periodFilter.type === "year" && periodFilter.year === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            onPeriodFilterChange({
                              type: "year",
                              year,
                            });
                          }}
                          className={cn(
                            "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:bg-muted"
                          )}
                        >
                          {year}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {periodFilter.type === "range" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={periodFilter.startDate || ""}
                      onChange={(e) =>
                        onPeriodFilterChange({
                          ...periodFilter,
                          type: "range",
                          startDate: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={periodFilter.endDate || ""}
                      onChange={(e) =>
                        onPeriodFilterChange({
                          ...periodFilter,
                          type: "range",
                          endDate: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              <button
                type="button"
                onClick={() => onAccountChange(null)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                  !selectedAccountId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span className="font-medium">All Accounts</span>
                    {!selectedAccountId && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </button>

              {accounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No accounts available
                </div>
              ) : (
                accounts.map((account) => {
                  const AccountIcon = ICON_MAP[account.icon] || Wallet;
                  const isSelected = selectedAccountId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => onAccountChange(account.id)}
                      className={cn(
                        "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${account.color}20` }}
                        >
                          <AccountIcon
                            className="h-5 w-5"
                            style={{ color: account.color }}
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.name}</span>
                            {account.defaultAccount && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {account.accountType} • {account.currency}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

