"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/trpc";
import { PeriodFilterDialog, type PeriodFilter } from "./period-filter-dialog";
import { TransactionsList } from "./transactions-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const formatCurrency = (amount: number, currency: string = "USD") => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100); // Amount is in cents
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

export function TransactionsPageClient() {
  // Default to current month
  const now = new Date();
  const [filter, setFilter] = useState<PeriodFilter>({
    type: "month",
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  // Build query parameters for fetching all transactions to determine available periods
  const { data: allTransactions } = api.transactions.list.useQuery({});

  // Extract available months and years from transactions
  const { availableMonths, availableYears } = useMemo(() => {
    if (!allTransactions) return { availableMonths: [], availableYears: [] };

    const months = new Set<string>();
    const years = new Set<number>();

    allTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      years.add(year);
      months.add(`${year}-${month}`);
    });

    return {
      availableMonths: Array.from(months).map((key) => {
        const [y, m] = key.split("-").map(Number);
        return { year: y, month: m };
      }),
      availableYears: Array.from(years),
    };
  }, [allTransactions]);

  // Build query parameters based on filter
  const queryParams = useMemo(() => {
    const params: {
      type?: "income" | "expense" | "transfer";
      startDate?: string;
      endDate?: string;
    } = {};

    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      const startDate = new Date(Date.UTC(filter.year, filter.month, 1));
      const endDate = new Date(Date.UTC(filter.year, filter.month + 1, 0, 23, 59, 59));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "year" && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      const startDate = new Date(Date.UTC(filter.year, 0, 1));
      const endDate = new Date(Date.UTC(filter.year, 11, 31, 23, 59, 59));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "range" && filter.startDate && filter.endDate) {
      params.startDate = filter.startDate;
      params.endDate = filter.endDate;
    }

    return params;
  }, [filter]);

  const { data: transactions, isLoading } = api.transactions.list.useQuery(queryParams);
  const { data: accounts } = api.accounts.list.useQuery();

  // Calculate income and expenses
  const { income, expenses } = useMemo(() => {
    if (!transactions) return { income: 0, expenses: 0 };

    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        incomeTotal += tx.amount;
      } else if (tx.type === "expense") {
        expensesTotal += tx.amount;
      }
      // Transfers are excluded from income/expense totals
    });

    return { income: incomeTotal, expenses: expensesTotal };
  }, [transactions]);

  const currency = accounts?.[0]?.currency || "USD";
  const netAmount = income - expenses;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor all your financial activity in one place
        </p>
      </header>

      {/* Period Filter */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilterDialog
          filter={filter}
          onFilterChange={setFilter}
          availableMonths={availableMonths}
          availableYears={availableYears}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setFilter({ type: "all" })}
          disabled={filter.type === "all"}
        >
          Clear filter
        </Button>
      </div>

      {/* Income vs Expenses Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Income</p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(income, currency)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(expenses, currency)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Net Amount (if both income and expenses exist) */}
      {(income > 0 || expenses > 0) && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
            <p
              className={cn(
                "text-lg font-semibold",
                netAmount > 0
                  ? "text-green-600 dark:text-green-400"
                  : netAmount < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
              )}
            >
              {netAmount > 0 ? "+" : ""}
              {formatCurrency(Math.abs(netAmount), currency)}
            </p>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <TransactionsList filter={filter} />
    </div>
  );
}

