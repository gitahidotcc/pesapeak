"use client";

import { useState, useMemo } from "react";
import type React from "react";
import { api } from "@/lib/trpc";
import Link from "next/link";
import {
    Banknote,
    CreditCard,
    Coins,
    Wallet,
    PiggyBank,
    type LucideIcon,
    Pencil,
    Trash2,
    Search,
    ArrowRightLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EditAccountDialog } from "./edit-account-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { AccountActionsSheet } from "./account-actions-sheet";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Highlight matching text in search results (handles multiple matches)
const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let index = textLower.indexOf(queryLower, lastIndex);

    while (index !== -1) {
        // Add text before the match
        if (index > lastIndex) {
            parts.push(text.slice(lastIndex, index));
        }
        // Add the highlighted match
        parts.push(
            <mark
                key={index}
                className="bg-primary/20 text-primary-foreground rounded px-0.5"
            >
                {text.slice(index, index + query.length)}
            </mark>
        );
        lastIndex = index + query.length;
        index = textLower.indexOf(queryLower, lastIndex);
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
};

export function AccountList() {
    const { data: accounts, isLoading } = api.accounts.list.useQuery();
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [deletingAccount, setDeletingAccount] = useState<{ id: string; name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedAccountForSheet, setSelectedAccountForSheet] = useState<any>(null);
    const router = useRouter();

    // Filter accounts based on search query (name and type)
    const filteredAccounts = useMemo(() => {
        if (!accounts) return [];
        if (!searchQuery.trim()) return accounts;

        const query = searchQuery.toLowerCase().trim();
        return accounts.filter((account) => {
            const accountName = account.name.toLowerCase();
            const typeLabel = (ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType).toLowerCase();
            return accountName.includes(query) || typeLabel.includes(query);
        });
    }, [accounts, searchQuery]);

    const handleShowTransactions = (account: any) => {
        router.push(`/dashboard/transactions?accountId=${account.id}`);
    };

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
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by account name or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredAccounts.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            No accounts found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your search query.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAccounts.map((account) => {
                        const Icon = ICON_MAP[account.icon] || Wallet;
                        const typeLabel = ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType;

                        return (
                            <div
                                key={account.id}
                                onClick={() => {
                                    // Only open sheet on mobile
                                    if (window.innerWidth < 640) {
                                        setSelectedAccountForSheet(account);
                                    }
                                }}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md sm:cursor-default cursor-pointer"
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
                                        {searchQuery.trim()
                                            ? highlightText(account.name, searchQuery)
                                            : account.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        {searchQuery.trim()
                                            ? highlightText(typeLabel, searchQuery)
                                            : typeLabel}
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

                                {/* Action buttons - Hidden on mobile, visible on desktop */}
                                <div className="mt-4 hidden sm:flex justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShowTransactions(account);
                                                }}
                                            >
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                Transactions
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingAccount(account);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingAccount({ id: account.id, name: account.name });
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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

            <AccountActionsSheet
                account={selectedAccountForSheet}
                open={!!selectedAccountForSheet}
                onOpenChange={(open) => !open && setSelectedAccountForSheet(null)}
                onEdit={(account) => {
                    setEditingAccount(account);
                    setSelectedAccountForSheet(null);
                }}
                onDelete={(account) => {
                    setDeletingAccount({ id: account.id, name: account.name });
                    setSelectedAccountForSheet(null);
                }}
                onShowTransactions={(account) => {
                    handleShowTransactions(account);
                    setSelectedAccountForSheet(null);
                }}
            />
        </>
    );
}
