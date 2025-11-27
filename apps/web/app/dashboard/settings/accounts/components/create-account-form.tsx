"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyDialogPicker } from "./currency-dialog-picker";
import { IconDialogPicker } from "@/components/shared/icon-picker/icon-dialog-picker";
import { ColorDialogPicker } from "@/components/shared/color-picker/color-dialog-picker";

const ACCOUNT_TYPES = [
    { value: "savings", label: "Savings" },
    { value: "credit-card", label: "Credit Card" },
    { value: "current", label: "Current" },
    { value: "mobile-money", label: "Mobile Money" },
    { value: "cash", label: "Cash" },
] as const;

export function CreateAccountForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [accountType, setAccountType] = useState<string>("savings");
    const [currency, setCurrency] = useState("USD");
    const [color, setColor] = useState("#222222");
    const [icon, setIcon] = useState("banknote");
    const [notes, setNotes] = useState("");
    const [initialBalance, setInitialBalance] = useState("0");
    const [defaultAccount, setDefaultAccount] = useState(false);

    const utils = api.useUtils();
    const createAccount = api.accounts.create.useMutation({
        onSuccess: () => {
            toast.success("Account created successfully");
            utils.accounts.list.invalidate();
            resetForm();
            setIsOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create account");
        },
    });

    const resetForm = () => {
        setName("");
        setAccountType("savings");
        setCurrency("USD");
        setColor("#222222");
        setIcon("banknote");
        setNotes("");
        setInitialBalance("0");
        setDefaultAccount(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Account name is required");
            return;
        }

        const balanceInCents = Math.round(parseFloat(initialBalance || "0") * 100);

        createAccount.mutate({
            name: name.trim(),
            accountType: accountType as any,
            currency,
            color,
            icon,
            notes: notes.trim(),
            initialBalance: balanceInCents,
            defaultAccount,
        });
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted"
                >
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Create New Account</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                        Add a new financial account to track
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-semibold text-foreground"
                            >
                                Account Name *
                            </label>
                            <input
                                id="name"
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
                                htmlFor="accountType"
                                className="text-sm font-semibold text-foreground"
                            >
                                Account Type *
                            </label>
                            <select
                                id="accountType"
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
                            htmlFor="initialBalance"
                            className="text-sm font-semibold text-foreground"
                        >
                            Initial Balance
                        </label>
                        <input
                            id="initialBalance"
                            type="number"
                            step="0.01"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="notes"
                            className="text-sm font-semibold text-foreground"
                        >
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
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
                            id="defaultAccount"
                            type="checkbox"
                            checked={defaultAccount}
                            onChange={(e) => setDefaultAccount(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <label
                            htmlFor="defaultAccount"
                            className="text-sm font-medium text-foreground"
                        >
                            Set as default account
                        </label>
                    </div>

                    {defaultAccount && (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                Setting this as the default account will unset any existing default account.
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createAccount.isPending}
                        >
                            {createAccount.isPending ? "Creating..." : "Create Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
