"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import {
    Banknote,
    CreditCard,
    Coins,
    Wallet,
    PiggyBank,
    type LucideIcon,
    Pencil,
    Trash2,
} from "lucide-react";
import { EditAccountDialog } from "./edit-account-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";

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

export function AccountList() {
    const { data: accounts, isLoading } = api.accounts.list.useQuery();
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [deletingAccount, setDeletingAccount] = useState<{ id: string; name: string } | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-32 animate-pulse rounded-2xl bg-muted/40"
                    />
                ))}
            </div>
        );
    }

    if (!accounts || accounts.length === 0) {
        return (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
                <div className="mx-auto max-w-md space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40">
                        <Wallet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        No accounts yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Create your first account to start tracking your finances.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => {
                    const Icon = ICON_MAP[account.icon] || Wallet;
                    const typeLabel = ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType;

                    return (
                        <div
                            key={account.id}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: `${account.color}20` }}
                                >
                                    <Icon
                                        className="h-6 w-6"
                                        style={{ color: account.color }}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    {account.defaultAccount && (
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {account.name}
                                </h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    {typeLabel}
                                </p>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Balance
                                    </span>
                                    <span className="text-xl font-bold text-foreground">
                                        {formatCurrency(account.totalBalance, account.currency)}
                                    </span>
                                </div>

                                {account.notes && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {account.notes}
                                    </p>
                                )}
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium uppercase tracking-wider">
                                    {account.currency}
                                </span>
                                <span>•</span>
                                <span>
                                    Created {new Date(account.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => setEditingAccount(account)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeletingAccount({ id: account.id, name: account.name })}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <EditAccountDialog
                account={editingAccount}
                open={!!editingAccount}
                onOpenChange={(open) => !open && setEditingAccount(null)}
            />

            <DeleteAccountDialog
                accountId={deletingAccount?.id || ""}
                accountName={deletingAccount?.name || ""}
                open={!!deletingAccount}
                onOpenChange={(open) => !open && setDeletingAccount(null)}
            />
        </>
    );
}
