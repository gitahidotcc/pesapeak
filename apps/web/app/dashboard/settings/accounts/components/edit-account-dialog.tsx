"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CurrencyDialogPicker } from "./currency-dialog-picker";
import { IconDialogPicker } from "./icon-dialog-picker";
import { ColorDialogPicker } from "./color-dialog-picker";

const ACCOUNT_TYPES = [
    { value: "savings", label: "Savings" },
    { value: "credit-card", label: "Credit Card" },
    { value: "current", label: "Current" },
    { value: "mobile-money", label: "Mobile Money" },
    { value: "cash", label: "Cash" },
] as const;

interface Account {
    id: string;
    name: string;
    accountType: string;
    currency: string;
    color: string;
    icon: string;
    notes: string;
    defaultAccount: boolean;
}

interface EditAccountDialogProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({
    account,
    open,
    onOpenChange,
}: EditAccountDialogProps) {
    const [name, setName] = useState("");
    const [accountType, setAccountType] = useState<string>("savings");
    const [currency, setCurrency] = useState("USD");
    const [color, setColor] = useState("#222222");
    const [icon, setIcon] = useState("banknote");
    const [notes, setNotes] = useState("");
    const [defaultAccount, setDefaultAccount] = useState(false);

    const utils = api.useUtils();

    const updateAccount = api.accounts.update.useMutation({
        onSuccess: () => {
            toast.success("Account updated successfully");
            utils.accounts.list.invalidate();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update account");
        },
    });

    // Populate form when account changes
    useEffect(() => {
        if (account) {
            setName(account.name);
            setAccountType(account.accountType);
            setCurrency(account.currency);
            setColor(account.color);
            setIcon(account.icon);
            setNotes(account.notes);
            setDefaultAccount(account.defaultAccount);
        }
    }, [account]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) return;

        if (!name.trim()) {
            toast.error("Account name is required");
            return;
        }

        updateAccount.mutate({
            id: account.id,
            name: name.trim(),
            accountType: accountType as any,
            currency,
            color,
            icon,
            notes: notes.trim(),
            defaultAccount,
        });
    };

    if (!account) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Account
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-name"
                                className="text-sm font-semibold text-foreground"
                            >
                                Account Name *
                            </label>
                            <input
                                id="edit-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Main Checking"
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="edit-accountType"
                                className="text-sm font-semibold text-foreground"
                            >
                                Account Type *
                            </label>
                            <select
                                id="edit-accountType"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                {ACCOUNT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="edit-notes"
                            className="text-sm font-semibold text-foreground"
                        >
                            Notes (Optional)
                        </label>
                        <textarea
                            id="edit-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional details..."
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Currency
                            </label>
                            <CurrencyDialogPicker value={currency} onSelect={setCurrency} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Icon
                            </label>
                            <IconDialogPicker value={icon} onSelect={setIcon} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Color
                            </label>
                            <ColorDialogPicker value={color} onSelect={setColor} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="edit-defaultAccount"
                            type="checkbox"
                            checked={defaultAccount}
                            onChange={(e) => setDefaultAccount(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <label
                            htmlFor="edit-defaultAccount"
                            className="text-sm font-medium text-foreground"
                        >
                            Set as default account
                        </label>
                    </div>

                    {defaultAccount && !account.defaultAccount && (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                Setting this as the default account will unset any existing default account.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateAccount.isPending}
                            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {updateAccount.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
