"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/trpc";
import { type PeriodFilter } from "./period-filter-dialog";
import { TransactionsFilterDialog } from "./transactions-filter-dialog";
import { TransactionsList } from "./transactions-list";
import { cn } from "@/lib/utils";

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

interface TransactionsPageClientProps {
  initialAccountId?: string | null;
}

export function TransactionsPageClient({ initialAccountId = null }: TransactionsPageClientProps) {
  // Default to current month
  const now = new Date();
  const [filter, setFilter] = useState<PeriodFilter>({
    type: "month",
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialAccountId);

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: periodsData } = api.transactions.periods.useQuery();
  const { availableMonths, availableYears } = useMemo(() => {
    return {
      availableMonths: periodsData?.availableMonths ?? [],
      availableYears: periodsData?.availableYears ?? [],
    };
  }, [periodsData]);

  // Build query parameters based on filter
  const queryParams = useMemo(() => {
    const params: {
      type?: "income" | "expense" | "transfer";
      startDate?: string;
      endDate?: string;
      accountId?: string;
    } = {};

    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      // Start: first day of the month at 00:00:00 UTC
      const startDate = new Date(Date.UTC(filter.year, filter.month, 1, 0, 0, 0, 0));
      // End: last day of the month at 23:59:59.999 UTC
      // Using month + 1 with day 0 gives us the last day of the current month
      const endDate = new Date(Date.UTC(filter.year, filter.month + 1, 0, 23, 59, 59, 999));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "year" && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      // Start: January 1st at 00:00:00 UTC
      const startDate = new Date(Date.UTC(filter.year, 0, 1, 0, 0, 0, 0));
      // End: December 31st at 23:59:59.999 UTC
      const endDate = new Date(Date.UTC(filter.year, 11, 31, 23, 59, 59, 999));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "range" && filter.startDate && filter.endDate) {
      params.startDate = filter.startDate;
      params.endDate = filter.endDate;
    }

    if (selectedAccountId) {
      params.accountId = selectedAccountId;
    }

    return params;
  }, [filter, selectedAccountId]);

  const { data: summaryData } = api.transactions.summary.useQuery(queryParams, {
    keepPreviousData: true,
  });

  const income = summaryData?.income ?? 0;
  const expenses = summaryData?.expenses ?? 0;

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

      {/* Filters */}
      {accounts && accounts.length > 0 && (
        <TransactionsFilterDialog
          periodFilter={filter}
          onPeriodFilterChange={setFilter}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
          accounts={accounts}
          availableMonths={availableMonths}
          availableYears={availableYears}
        />
      )}

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
      <TransactionsList 
        filter={filter} 
        selectedAccountId={selectedAccountId}
      />
    </div>
  );
}

