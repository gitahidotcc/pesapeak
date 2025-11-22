"use client";

import { useEffect } from "react";
import { Minus, Plus, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransactionForm } from "../hooks/use-transaction-form";
import { AccountPicker } from "./account-picker";
import { CategoryPicker } from "./category-picker";
import { DateTimePicker } from "./date-time-picker";
import { AttachmentPicker } from "./attachment-picker";
import type { TransactionType } from "../types/transaction";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const {
    formData,
    errors,
    accounts,
    categories,
    defaultAccount,
    updateField,
    setTransactionType,
    validate,
    resetForm,
    submit,
    isSubmitting,
  } = useTransactionForm();

  // Set default account when dialog opens
  useEffect(() => {
    if (open && defaultAccount) {
      if (formData.type === "transfer") {
        if (!formData.fromAccountId) {
          updateField("fromAccountId", defaultAccount.id);
        }
      } else {
        if (!formData.accountId) {
          updateField("accountId", defaultAccount.id);
        }
      }
    }
  }, [open, formData.type, formData.accountId, formData.fromAccountId, defaultAccount, updateField]);

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await submit();
      handleOpenChange(false);
    }
  };

  const transactionTypes: Array<{
    type: TransactionType;
    label: string;
    icon: typeof Plus;
    color: string;
  }> = [
    {
      type: "income",
      label: "Income",
      icon: Plus,
      color: "text-green-600 dark:text-green-400",
    },
    {
      type: "expense",
      label: "Expense",
      icon: Minus,
      color: "text-red-600 dark:text-red-400",
    },
    {
      type: "transfer",
      label: "Transfer",
      icon: ArrowRightLeft,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  const TypeIcon = transactionTypes.find((t) => t.type === formData.type)?.icon || Minus;
  const typeColor = transactionTypes.find((t) => t.type === formData.type)?.color || "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input - At the top */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Amount
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <TypeIcon className={`h-5 w-5 ${typeColor}`} />
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-xl border border-border bg-background pl-12 pr-4 py-2.5 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.amount ? "border-destructive" : ""
                }`}
                required
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Transaction Type Selection - Tabs */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Transaction Type
            </label>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
              {transactionTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTransactionType(type)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    formData.type === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${formData.type === type ? color : ""}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Assignment
            </h3>

            {formData.type === "transfer" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AccountPicker
                  accounts={accounts.filter((acc) => acc.id !== formData.toAccountId)}
                  selectedAccountId={formData.fromAccountId}
                  onSelect={(id) => updateField("fromAccountId", id)}
                  error={errors.fromAccountId}
                  label="From Account"
                />

                <AccountPicker
                  accounts={accounts.filter((acc) => acc.id !== formData.fromAccountId)}
                  selectedAccountId={formData.toAccountId}
                  onSelect={(id) => updateField("toAccountId", id)}
                  error={errors.toAccountId}
                  label="To Account"
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AccountPicker
                  accounts={accounts}
                  selectedAccountId={formData.accountId}
                  onSelect={(id) => updateField("accountId", id)}
                  error={errors.accountId}
                />

                <CategoryPicker
                  categories={categories}
                  selectedCategoryId={formData.categoryId}
                  onSelect={(id) => updateField("categoryId", id)}
                  error={errors.categoryId}
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Date
            </h3>
            <DateTimePicker
              date={formData.date}
              time={formData.time}
              includeTime={formData.includeTime}
              onDateChange={(date) => updateField("date", date)}
              onTimeChange={(time) => updateField("time", time)}
              onIncludeTimeChange={(include) => updateField("includeTime", include)}
              dateError={errors.date}
              timeError={errors.time}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Attachment */}
          <AttachmentPicker
            attachment={formData.attachment}
            onSelect={(file) => updateField("attachment", file)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

