"use client";

import { useState } from "react";
import { Edit, Trash2, X, type LucideIcon } from "lucide-react";
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
  ArrowRightLeft,
  Plus,
  Minus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import type { Transaction } from "@pesapeak/shared/types/transactions";

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

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  accounts: Array<{ id: string; name: string; currency: string }>;
  folders: Array<{
    id: string;
    name: string;
    categories: Array<{ id: string; name: string }>;
  }>;
}

const formatCurrency = (amount: number, currency: string = "USD") => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
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

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  accounts,
  folders,
}: TransactionDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const utils = api.useUtils();
  const deleteTransaction = api.transactions.delete.useMutation({
    onSuccess: async () => {
      toast.success("Transaction deleted successfully");
      // Invalidate all transaction list queries (including infinite queries)
      // This will mark them as stale and trigger automatic refetch
      await utils.transactions.list.invalidate(undefined);
      // Invalidate summary query to update totals
      await utils.transactions.summary.invalidate(undefined);
      // Invalidate periods query to update month summaries
      await utils.transactions.periods.invalidate(undefined);
      // Refresh account balances
      await utils.accounts.list.invalidate();
      setIsConfirmOpen(false);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";

  const CategoryIcon = transaction.categoryIcon && ICON_MAP[transaction.categoryIcon]
    ? ICON_MAP[transaction.categoryIcon]
    : isIncome
      ? Plus
      : isExpense
        ? Minus
        : ArrowRightLeft;
  const categoryColor = transaction.categoryColor || undefined;

  const getAccountName = (accountId: string | null) => {
    if (!accountId) return "Unknown";
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name || "Unknown";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    for (const folder of folders) {
      const category = folder.categories.find((cat) => cat.id === categoryId);
      if (category) return category.name;
    }
    return "Uncategorized";
  };

  const getCurrency = () => {
    const accountId = transaction.accountId || transaction.fromAccountId;
    if (!accountId) return "USD";
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.currency || "USD";
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    await deleteTransaction.mutateAsync({ id: transaction.id });
  };

  const handleEdit = () => {
    onEdit(transaction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-hidden p-0 flex flex-col">
        {/* Header with actions */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-semibold">Transaction Details</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9"
            >
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isDeleting}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero section - Amount and Icon */}
          <div className={cn(
            "relative overflow-hidden px-4 sm:px-6 py-8 sm:py-10",
            categoryColor
              ? undefined
              : isIncome && "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5",
            categoryColor
              ? undefined
              : isExpense && "bg-gradient-to-br from-rose-500/10 to-rose-600/5",
            categoryColor
              ? undefined
              : isTransfer && "bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          )}
            style={
              categoryColor
                ? {
                  background: `linear-gradient(to bottom right, ${categoryColor}15, ${categoryColor}08)`,
                }
                : undefined
            }>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div
                className={cn(
                  "flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 shadow-lg",
                  categoryColor
                    ? undefined
                    : isIncome && "bg-emerald-500/20 border-emerald-500/30",
                  categoryColor
                    ? undefined
                    : isExpense && "bg-rose-500/20 border-rose-500/30",
                  categoryColor
                    ? undefined
                    : isTransfer && "bg-blue-500/20 border-blue-500/30"
                )}
                style={
                  categoryColor
                    ? {
                      backgroundColor: `${categoryColor}20`,
                      borderColor: `${categoryColor}40`,
                    }
                    : undefined
                }
              >
                <CategoryIcon
                  className={cn(
                    "h-10 w-10 sm:h-12 sm:w-12",
                    categoryColor
                      ? undefined
                      : isIncome && "text-emerald-600 dark:text-emerald-400",
                    categoryColor
                      ? undefined
                      : isExpense && "text-rose-600 dark:text-rose-400",
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
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Amount
                </div>
                <div
                  className={cn(
                    "text-4xl sm:text-5xl font-bold tabular-nums",
                    isIncome && "text-emerald-600 dark:text-emerald-400",
                    isExpense && "text-rose-600 dark:text-rose-400",
                    isTransfer && "text-blue-600 dark:text-blue-400"
                  )}
                >
                  {isIncome && "+"}
                  {isExpense && "-"}
                  {formatCurrency(transaction.amount, getCurrency())}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs sm:text-sm font-medium">
                  <span className="capitalize">{transaction.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details sections */}
          <div className="px-4 sm:px-6 py-6 space-y-4">
            {/* Assignment Details Card */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assignment
              </h3>
              {isTransfer ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground">From Account</div>
                    <div className="text-base sm:text-lg font-semibold">{getAccountName(transaction.fromAccountId)}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground">To Account</div>
                    <div className="text-base sm:text-lg font-semibold">{getAccountName(transaction.toAccountId)}</div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground">Account</div>
                    <div className="text-base sm:text-lg font-semibold">{getAccountName(transaction.accountId)}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground">Category</div>
                    <div className="text-base sm:text-lg font-semibold">{getCategoryName(transaction.categoryId)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Card */}
            {transaction.tags && transaction.tags.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map(tag => (
                    <div key={tag.id} className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Time Card */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Date & Time
              </h3>
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-semibold">{formatDate(transaction.date)}</div>
                {transaction.time && (
                  <div className="text-sm text-muted-foreground">
                    {formatTime(transaction.time)}
                  </div>
                )}
              </div>
            </div>

            {/* Notes Card */}
            {transaction.notes && (
              <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </h3>
                <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{transaction.notes}</div>
              </div>
            )}

            {/* Attachment Card */}
            {transaction.attachmentPath && transaction.attachmentFileName && (() => {
              // Extract userId and filename from attachmentPath
              // Path format: dataDir/transactions/{userId}/{filename}
              // Handle both Windows (\) and Unix (/) path separators
              const normalizedPath = transaction.attachmentPath.replace(/\\/g, "/");
              const pathParts = normalizedPath.split("/");
              const transactionsIndex = pathParts.findIndex((part) => part === "transactions");
              if (transactionsIndex === -1 || transactionsIndex + 2 >= pathParts.length) {
                return null;
              }
              const userId = pathParts[transactionsIndex + 1];
              const filename = pathParts[transactionsIndex + 2];
              const fileUrl = `/api/files/transactions/${userId}/${filename}`;

              const isImage = transaction.attachmentMimeType?.startsWith("image/");
              const isPdf = transaction.attachmentMimeType === "application/pdf";
              const canPreview = isImage || isPdf;

              return (
                <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Attachment
                  </h3>

                  {canPreview ? (
                    <div className="space-y-3">
                      {isImage && (
                        <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                          <img
                            src={fileUrl}
                            alt={transaction.attachmentFileName}
                            className="w-full h-auto max-h-96 object-contain"
                          />
                        </div>
                      )}
                      {isPdf && (
                        <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                          <iframe
                            src={fileUrl}
                            title={transaction.attachmentFileName}
                            className="w-full h-96"
                          />
                        </div>
                      )}
                      <div className="text-sm">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-2"
                        >
                          {transaction.attachmentFileName}
                          <span className="text-xs text-muted-foreground">(Open in new tab)</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {transaction.attachmentFileName}
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Metadata */}
            <div className="pt-2 pb-4 border-t border-border/60 space-y-1.5">
              <div className="text-xs text-muted-foreground">
                Created: {new Date(transaction.createdAt).toLocaleString()}
              </div>
              {transaction.updatedAt !== transaction.createdAt && (
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(transaction.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete confirmation dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={(open) => !isDeleting && setIsConfirmOpen(open)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete transaction</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove this transaction from your
              history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

