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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc";
import { toast } from "sonner";

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

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  accountId: string | null;
  categoryId: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  date: string;
  time: string | null;
  notes: string;
  attachmentPath: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  const utils = api.useUtils();
  const deleteTransaction = api.transactions.delete.useMutation({
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      utils.transactions.list.invalidate();
      utils.accounts.list.invalidate();
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    setIsDeleting(true);
    await deleteTransaction.mutateAsync({ id: transaction.id });
  };

  const handleEdit = () => {
    onEdit(transaction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
        {/* Header with Edit and Delete buttons */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <h2 className="text-2xl font-semibold">Transaction Details</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Amount and Icon */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-xl",
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
                  "h-8 w-8",
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
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Amount</div>
              <div
                className={cn(
                  "text-3xl font-bold",
                  isIncome && "text-green-600 dark:text-green-400",
                  isExpense && "text-red-600 dark:text-red-400",
                  isTransfer && "text-blue-600 dark:text-blue-400"
                )}
              >
                {isIncome && "+"}
                {isExpense && "-"}
                {formatCurrency(transaction.amount, getCurrency())}
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Transaction Type
            </div>
            <div className="text-lg font-medium capitalize">{transaction.type}</div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground">
              Assignment
            </div>
            {isTransfer ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">From Account</div>
                  <div className="text-base font-medium">{getAccountName(transaction.fromAccountId)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">To Account</div>
                  <div className="text-base font-medium">{getAccountName(transaction.toAccountId)}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Account</div>
                  <div className="text-base font-medium">{getAccountName(transaction.accountId)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="text-base font-medium">{getCategoryName(transaction.categoryId)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground">
              Date & Time
            </div>
            <div>
              <div className="text-base font-medium">{formatDate(transaction.date)}</div>
              {transaction.time && (
                <div className="text-sm text-muted-foreground mt-1">
                  {formatTime(transaction.time)}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-muted-foreground">
                Notes
              </div>
              <div className="text-base whitespace-pre-wrap">{transaction.notes}</div>
            </div>
          )}

          {/* Attachment */}
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
              <div className="space-y-3">
                <div className="text-sm font-semibold text-muted-foreground">
                  Attachment
                </div>
                
                {canPreview ? (
                  <div className="space-y-3">
                    {isImage && (
                      <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                        <img
                          src={fileUrl}
                          alt={transaction.attachmentFileName}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    )}
                    {isPdf && (
                      <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
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
                  <div className="text-base">
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
          <div className="pt-4 border-t border-border space-y-2">
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
      </DialogContent>
    </Dialog>
  );
}

