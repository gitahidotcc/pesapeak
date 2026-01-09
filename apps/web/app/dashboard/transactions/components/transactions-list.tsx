"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { PeriodFilter } from "./period-filter-dialog";
import { TransactionDetailsDialog } from "./transaction-details-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { TransactionItem } from "./transaction-item";
import { TransactionListSkeleton, LoadingMoreIndicator } from "./transaction-list-skeleton";
import { EmptyState } from "./empty-state";

interface TransactionsListProps {
  filter: PeriodFilter;
  selectedAccountId?: string | null;
  selectedCategoryId?: string | null;
  searchQuery?: string;
  onAddTransaction?: () => void;
  onClearFilters?: () => void;
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

// Define types locally for now, ideally should be shared
type Transaction = any;

const PAGE_SIZE = 50;

type ListItem =
  | { type: "header"; date: string; count: number; total: number; id: string }
  | { type: "transaction"; data: Transaction; id: string };

export function TransactionsList({
  filter,
  selectedAccountId,
  selectedCategoryId,
  searchQuery = "",
  onAddTransaction,
  onClearFilters,
}: TransactionsListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: folders } = api.categories.list.useQuery();

  const filterParams = useMemo(() => {
    const params: {
      type?: "income" | "expense" | "transfer";
      startDate?: string;
      endDate?: string;
      accountId?: string;
      categoryId?: string;
      search?: string;
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

    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    return params;
  }, [filter, selectedAccountId, selectedCategoryId, searchQuery]);

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

  const flatItems = useMemo(() => {
    if (!data?.pages) return [];
    const allTransactions = data.pages.flatMap((page) => page.items);

    if (allTransactions.length === 0) return [];

    const grouped: Record<string, Transaction[]> = {};
    allTransactions.forEach((transaction) => {
      const dateKey = transaction.date.split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const items: ListItem[] = [];

    sortedDates.forEach((date) => {
      const txs = grouped[date]!;
      // Sort within day
      txs.sort((a, b) => {
        if (a.time && b.time) return b.time.localeCompare(a.time);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Calculate total
      const total = txs.reduce((sum, tx) => {
        if (tx.type === "income") return sum + tx.amount;
        if (tx.type === "expense") return sum - tx.amount;
        return sum;
      }, 0);

      items.push({
        type: "header",
        date,
        count: txs.length,
        total,
        id: `header-${date}`,
      });

      txs.forEach((tx) => {
        items.push({
          type: "transaction",
          data: tx,
          id: tx.id,
        });
      });
    });

    return items;
  }, [data]);

  const virtualizer = useVirtualizer({
    count: flatItems.length + (hasNextPage ? 1 : 0), // Add 1 for the loader
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Loader
      if (index >= flatItems.length) return 50;

      const item = flatItems[index];
      if (item.type === "header") return 60; // Approximate header height
      return 88; // Approximate transaction item height
    },
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= flatItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    flatItems.length,
    isFetchingNextPage,
    virtualItems,
  ]);

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

  if (status === "pending") {
    return <TransactionListSkeleton />;
  }

  if (status === "success" && flatItems.length === 0) {
    const hasFilters = Boolean(
      selectedAccountId || 
      selectedCategoryId || 
      searchQuery || 
      (filter.type !== "all")
    );
    
    return (
      <EmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onAddTransaction={onAddTransaction}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div 
      className="w-full min-h-[400px] max-h-[calc(100vh-24rem)] sm:max-h-[calc(100vh-20rem)]" 
      ref={parentRef} 
      style={{ overflowY: "auto", contain: "strict", scrollBehavior: "smooth" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoader = virtualItem.index >= flatItems.length;

          if (isLoader) {
            return (
              <div
                key="loader"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isFetchingNextPage ? <LoadingMoreIndicator /> : null}
              </div>
            );
          }

          const item = flatItems[virtualItem.index];

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="px-1"
            >
              {item.type === "header" ? (
                <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0 border-b-2 border-border/60 bg-background/95 backdrop-blur-sm pb-3 pt-6 mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    {formatDate(item.date)}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {item.count} {item.count === 1 ? "transaction" : "transactions"}
                    </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        item.total > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : item.total < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {item.total > 0 ? "+" : item.total < 0 ? "-" : ""}
                      {formatCurrency(
                        Math.abs(item.total),
                        accounts?.[0]?.currency || "USD"
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  <TransactionItem
                    transaction={item.data}
                    onClick={() => {
                      setSelectedTransaction(item.data);
                      setIsDetailsOpen(true);
                    }}
                    getAccountName={getAccountName}
                    getCategoryName={getCategoryName}
                    formatCurrency={formatCurrency}
                    formatTime={formatTime}
                    currency={accounts?.[0]?.currency || "USD"}
                  />
                </div>
              )}
            </div>
          );
        })}
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

