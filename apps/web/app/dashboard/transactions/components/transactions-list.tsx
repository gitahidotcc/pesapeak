"use client";

import { useMemo } from "react";
import { ArrowRightLeft, Minus, Plus } from "lucide-react";
import { api } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { PeriodFilter } from "./period-filter-dialog";

interface TransactionsListProps {
  filter: PeriodFilter;
}

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (time: string | null) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export function TransactionsList({ filter }: TransactionsListProps) {
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
  const { data: folders } = api.categories.list.useQuery();

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!transactions) return [];

    const grouped: Record<string, typeof transactions> = {};
    transactions.forEach((transaction) => {
      const dateKey = transaction.date.split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    // Sort dates (most recent first)
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, txs]) => ({
        date,
        transactions: txs.sort((a, b) => {
          // Sort by time if available, otherwise by creation time
          if (a.time && b.time) {
            return b.time.localeCompare(a.time);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
      }));
  }, [transactions]);

  // Calculate totals for each date group
  const getDateTotal = (txs: typeof transactions) => {
    if (!txs) return 0;
    return txs.reduce((sum, tx) => {
      if (tx.type === "income") return sum + tx.amount;
      if (tx.type === "expense") return sum - tx.amount;
      return sum; // Transfers don't affect total
    }, 0);
  };

  const getAccountName = (accountId: string | null) => {
    if (!accountId || !accounts) return "Unknown";
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name || "Unknown";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !folders) return "Uncategorized";
    for (const folder of folders) {
      const category = folder.categories.find((cat) => cat.id === categoryId);
      if (category) return category.name;
    }
    return "Uncategorized";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return Plus;
      case "expense":
        return Minus;
      case "transfer":
        return ArrowRightLeft;
      default:
        return Minus;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No transactions found for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedTransactions.map(({ date, transactions: txs }) => {
        const dateTotal = getDateTotal(txs);
        const dateTotalFormatted = formatCurrency(
          Math.abs(dateTotal),
          accounts?.[0]?.currency || "USD"
        );

        return (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {formatDate(date)}
                </h3>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    dateTotal > 0
                      ? "text-green-600 dark:text-green-400"
                      : dateTotal < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  )}
                >
                  {dateTotal > 0 ? "+" : ""}
                  {dateTotalFormatted}
                </div>
                <div className="text-xs text-muted-foreground">
                  {txs.length} {txs.length === 1 ? "transaction" : "transactions"}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {txs.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const isIncome = transaction.type === "income";
                const isExpense = transaction.type === "expense";
                const isTransfer = transaction.type === "transfer";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isIncome && "bg-green-100 dark:bg-green-900/30",
                        isExpense && "bg-red-100 dark:bg-red-900/30",
                        isTransfer && "bg-blue-100 dark:bg-blue-900/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isIncome && "text-green-600 dark:text-green-400",
                          isExpense && "text-red-600 dark:text-red-400",
                          isTransfer && "text-blue-600 dark:text-blue-400"
                        )}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {isTransfer
                            ? `Transfer: ${getAccountName(transaction.fromAccountId)} → ${getAccountName(transaction.toAccountId)}`
                            : transaction.notes || getCategoryName(transaction.categoryId)}
                        </span>
                        {transaction.time && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(transaction.time)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {!isTransfer && (
                          <>
                            <span>{getCategoryName(transaction.categoryId)}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{getAccountName(transaction.accountId || transaction.fromAccountId)}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div
                      className={cn(
                        "text-right font-semibold",
                        isIncome && "text-green-600 dark:text-green-400",
                        isExpense && "text-red-600 dark:text-red-400",
                        isTransfer && "text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {isIncome && "+"}
                      {isExpense && "-"}
                      {formatCurrency(
                        transaction.amount,
                        accounts?.find(
                          (acc) =>
                            acc.id === transaction.accountId ||
                            acc.id === transaction.fromAccountId
                        )?.currency || "USD"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

