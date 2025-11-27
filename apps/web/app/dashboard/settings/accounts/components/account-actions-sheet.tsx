"use client";

import { Pencil, FileText, Trash2, X, type LucideIcon } from "lucide-react";
import {
    Banknote,
    Wallet,
    CreditCard,
    PiggyBank,
    Coins,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AppRouter } from "@pesapeak/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Account = RouterOutputs["accounts"]["list"][number];

const ICON_MAP: Record<string, LucideIcon> = {
    banknote: Banknote,
    wallet: Wallet,
    "credit-card": CreditCard,
    "piggy-bank": PiggyBank,
    coins: Coins,
};

interface AccountActionsSheetProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
    onShowTransactions: (account: Account) => void;
}

export function AccountActionsSheet({
    account,
    open,
    onOpenChange,
    onEdit,
    onDelete,
    onShowTransactions,
}: AccountActionsSheetProps) {
    if (!account) return null;

    const Icon = ICON_MAP[account.icon] || Wallet;

    const handleAction = (action: () => void) => {
        action();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 sm:rounded-lg md:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%] fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 sm:translate-y-[-50%] sm:translate-x-[-50%] sm:left-[50%] sm:top-[50%] sm:bottom-auto rounded-t-2xl sm:rounded-t-lg border-b-0 sm:border-b sm:rounded-b-lg [&>button]:hidden">
                {/* Mobile: Bottom sheet style */}
                <div className="flex flex-col sm:hidden max-h-[80vh] overflow-y-auto">
                    {/* Handle bar for mobile */}
                    <div className="flex items-center justify-center pt-3 pb-2">
                        <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
                    </div>

                    {/* Account info */}
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${account.color}20` }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: account.color }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {account.name}
                                </h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    {account.accountType}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border px-4 py-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto"
                            onClick={() => handleAction(() => onShowTransactions(account))}
                        >
                            <FileText className="h-5 w-5" />
                            Show Transactions
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto"
                            onClick={() => handleAction(() => onEdit(account))}
                        >
                            <Pencil className="h-5 w-5" />
                            Edit Account
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto text-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(() => onDelete(account))}
                        >
                            <Trash2 className="h-5 w-5" />
                            Delete Account
                        </Button>
                    </div>

                    {/* Cancel button */}
                    <div className="border-t border-border p-4">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Desktop: Menu style (Hidden on desktop as we use inline buttons, but kept for consistency if needed later or for tablet) */}
                <div className="hidden flex-col sm:flex">
                    <div className="p-4">
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${account.color}20` }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: account.color }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {account.name}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto"
                                onClick={() => handleAction(() => onShowTransactions(account))}
                            >
                                <FileText className="h-4 w-4" />
                                Show Transactions
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto"
                                onClick={() => handleAction(() => onEdit(account))}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Account
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto text-destructive hover:bg-destructive/10"
                                onClick={() => handleAction(() => onDelete(account))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
