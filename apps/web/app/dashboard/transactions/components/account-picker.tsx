"use client";

import { useState } from "react";
import { Search, Check, Wallet, type LucideIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Savings",
  "credit-card": "Credit Card",
  current: "Current",
  "mobile-money": "Mobile Money",
  cash: "Cash",
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100); // Assuming amounts are stored in cents
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  color: string;
  icon: string;
  defaultAccount: boolean;
  totalBalance: number;
}

interface AccountPickerProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  error?: string;
  label?: string;
}

export function AccountPicker({
  accounts,
  selectedAccountId,
  onSelect,
  error,
  label = "Account",
}: AccountPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const Icon = selectedAccount ? ICON_MAP[selectedAccount.icon] || Wallet : Wallet;

  const filteredAccounts = accounts.filter((account) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    const accountName = account.name.toLowerCase();
    const typeLabel = (ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType).toLowerCase();
    return accountName.includes(searchLower) || typeLabel.includes(searchLower);
  });

  const handleSelect = (accountId: string) => {
    onSelect(accountId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              error && "border-destructive",
              "flex items-center justify-between"
            )}
          >
            {selectedAccount ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${selectedAccount.color}20` }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: selectedAccount.color }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{selectedAccount.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(selectedAccount.totalBalance, selectedAccount.currency)}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select an account</span>
            )}
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
              {filteredAccounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {accounts.length === 0 ? "No accounts available" : "No accounts found"}
                </div>
              ) : (
                filteredAccounts.map((account) => {
                  const AccountIcon = ICON_MAP[account.icon] || Wallet;
                  const isSelected = selectedAccountId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSelect(account.id)}
                      className={cn(
                        "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted",
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
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
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              {ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType} • {account.currency}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(account.totalBalance, account.currency)}
                            </span>
                          </div>
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
          </div>
        </DialogContent>
      </Dialog>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
