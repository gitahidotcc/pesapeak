"use client";

import { useState } from "react";
import { Wallet, ChevronDown, Check, type LucideIcon } from "lucide-react";
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

interface AccountFilterDialogProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string | null) => void;
}

export function AccountFilterDialog({
  accounts,
  selectedAccountId,
  onAccountChange,
}: AccountFilterDialogProps) {
  const [open, setOpen] = useState(false);

  const selectedAccount = selectedAccountId
    ? accounts.find((acc) => acc.id === selectedAccountId)
    : null;

  const handleSelect = (accountId: string | null) => {
    onAccountChange(accountId);
    setOpen(false);
  };

  const getFilterLabel = () => {
    if (selectedAccount) {
      return selectedAccount.name;
    }
    return "All Accounts";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full border-border/60 bg-background/60 px-4 py-2 text-sm shadow-sm hover:bg-background"
        >
          {selectedAccount ? (
            <div
              className="flex h-4 w-4 items-center justify-center rounded"
              style={{ backgroundColor: `${selectedAccount.color}20` }}
            >
              {(() => {
                const Icon = ICON_MAP[selectedAccount.icon] || Wallet;
                return (
                  <Icon
                    className="h-3 w-3"
                    style={{ color: selectedAccount.color }}
                  />
                );
              })()}
            </div>
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          <span>{getFilterLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-border/60 bg-background/95 shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Filter by Account
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleSelect(null)}
              disabled={!selectedAccountId}
            >
              Clear filter
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-2 max-h-[400px] space-y-2 overflow-y-auto">
          {/* All Accounts Option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
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

          {/* Individual Accounts */}
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
                  onClick={() => handleSelect(account.id)}
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
      </DialogContent>
    </Dialog>
  );
}

