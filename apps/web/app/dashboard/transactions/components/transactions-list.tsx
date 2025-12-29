"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRightLeft, Minus, Plus, type LucideIcon } from "lucide-react";
import {
  Banknote,
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  Landmark,
  Building,
  Building2,
  Home,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Euro,
  Bitcoin,
  Smartphone,
  Car,
  Plane,
  Gift,
  Heart,
} from "lucide-react";
import { api } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { PeriodFilter } from "./period-filter-dialog";
import { TransactionDetailsDialog } from "./transaction-details-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
  landmark: Landmark,
  building: Building,
  "building-2": Building2,
  home: Home,
  briefcase: Briefcase,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  euro: Euro,
  bitcoin: Bitcoin,
  smartphone: Smartphone,
  car: Car,
  plane: Plane,
  gift: Gift,
  heart: Heart,
};

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
  landmark: Landmark,
  building: Building,
  "building-2": Building2,
  home: Home,
  briefcase: Briefcase,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  euro: Euro,
  bitcoin: Bitcoin,
  smartphone: Smartphone,
  car: Car,
  plane: Plane,
  gift: Gift,
  heart: Heart,
};

interface TransactionsListProps {
  filter: PeriodFilter;
  selectedAccountId?: string | null;
  selectedCategoryId?: string | null;
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

type Transaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  accountId: string | null;
  categoryId: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  parentTransactionId: string | null;
  isFee: boolean;
  date: string;
  time: string | null;
  notes: string;
  attachmentPath: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 50;

export function TransactionsList({
  filter,
  selectedAccountId,
  selectedCategoryId,
}: TransactionsListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: folders } = api.categories.list.useQuery();

  const filterParams = useMemo(() => {
    const params: {
      type?: "income" | "expense" | "transfer";
      startDate?: string;
      endDate?: string;
      accountId?: string;
      categoryId?: string;
    } = {};

    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      const startDate = new Date(Date.UTC(filter.year, filter.month, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(filter.year, filter.month + 1, 0, 23, 59, 59, 999));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "year" && filter.year !== undefined) {
      const startDate = new Date(Date.UTC(filter.year, 0, 1, 0, 0, 0, 0));
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

    if (selectedCategoryId) {
      params.categoryId = selectedCategoryId;
    }

    return params;
  }, [filter, selectedAccountId, selectedCategoryId]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.transactions.list.useInfiniteQuery(
    {
      ...filterParams,
      limit: PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
    }
  );

  const transactions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

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
          if (a.time && b.time) {
            return b.time.localeCompare(a.time);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
      }));
  }, [transactions]);

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

  if (status === "pending" && transactions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  if (status === "success" && transactions.length === 0) {
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
              <div className="text-xs text-muted-foreground">
                {txs.length} {txs.length === 1 ? "transaction" : "transactions"}
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {txs
                .filter((transaction) => !transaction.isFee)
                .map((transaction) => {
                const isIncome = transaction.type === "income";
                const isExpense = transaction.type === "expense";
                const isTransfer = transaction.type === "transfer";
                
                // Use category icon if available, otherwise fall back to transaction type icon
                const CategoryIcon = transaction.categoryIcon && ICON_MAP[transaction.categoryIcon]
                  ? ICON_MAP[transaction.categoryIcon]
                  : getTransactionIcon(transaction.type);
                const categoryColor = transaction.categoryColor || undefined;

                const feeLines =
                  transactions?.filter(
                    (tx) => tx.parentTransactionId === transaction.id && tx.isFee
                  ) ?? [];

                return (
                  <div key={transaction.id} className="space-y-1">
                    <div
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsDetailsOpen(true);
                      }}
                      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                    >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        categoryColor
                          ? undefined
                          : isIncome && "bg-green-100 dark:bg-green-900/30",
                        categoryColor
                          ? undefined
                          : isExpense && "bg-red-100 dark:bg-red-900/30",
                        categoryColor
                          ? undefined
                          : isTransfer && "bg-blue-100 dark:bg-blue-900/30"
                      )}
                      style={
                        categoryColor
                          ? {
                              backgroundColor: `${categoryColor}20`,
                            }
                          : undefined
                      }
                    >
                      <CategoryIcon
                        className={cn(
                          "h-5 w-5",
                          categoryColor
                            ? undefined
                            : isIncome && "text-green-600 dark:text-green-400",
                          categoryColor
                            ? undefined
                            : isExpense && "text-red-600 dark:text-red-400",
                          categoryColor
                            ? undefined
                            : isTransfer && "text-blue-600 dark:text-blue-400"
                        )}
                        style={
                          categoryColor
                            ? {
                                color: categoryColor,
                              }
                            : undefined
                        }
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

                    {/* Fee rows (if any) */}
                    {feeLines.map((fee) => (
                      <div
                        key={fee.id}
                        className="ml-10 flex items-center justify-between rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-2 text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">Fee</span>
                          <span className="text-[11px] text-muted-foreground">
                            {getCategoryName(fee.categoryId)} •{" "}
                            {getAccountName(fee.accountId || transaction.accountId)}
                          </span>
                        </div>
                        <div className="font-semibold text-red-500 dark:text-red-400">
                          -{formatCurrency(fee.amount, accounts?.[0]?.currency || "USD")}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              
              {/* Date Total - Below last transaction */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
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
                  {dateTotal > 0 ? "+" : dateTotal < 0 ? "-" : ""}
                  {dateTotalFormatted}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Infinite Scroll Trigger */}
      <div ref={sentinelRef} className="py-4">
        {isFetchingNextPage && hasNextPage && (
          <div className="text-center text-sm text-muted-foreground">
            Loading more transactions...
          </div>
        )}
        {!hasNextPage && transactions.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No more transactions to load
          </div>
        )}
      </div>

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={(transaction) => {
          setEditingTransaction(transaction);
          setIsEditDialogOpen(true);
        }}
        accounts={accounts || []}
        folders={folders || []}
      />

      {/* Edit Transaction Dialog */}
      <AddTransactionDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingTransaction(null);
          }
        }}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}

