"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
    accountId: string;
    accountName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
    accountId,
    accountName,
    open,
    onOpenChange,
}: DeleteAccountDialogProps) {
    const [confirmText, setConfirmText] = useState("");

    const utils = api.useUtils();

    const { data: transactionData } = api.accounts.getTransactionCount.useQuery(
        { accountId },
        { enabled: open }
    );

    const deleteAccount = api.accounts.delete.useMutation({
        onSuccess: () => {
            toast.success("Account deleted successfully");
            utils.accounts.list.invalidate();
            onOpenChange(false);
            setConfirmText("");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete account");
        },
    });

    const transactionCount = transactionData?.count ?? 0;
    const canDelete = confirmText === accountName;

    const handleDelete = () => {
        if (!canDelete) return;
        deleteAccount.mutate({ id: accountId });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <p className="text-sm font-medium text-foreground">
                            You are about to delete:
                        </p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                            {accountName}
                        </p>
                    </div>

                    {transactionCount > 0 && (
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                        Warning: This account has {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
                                    </p>
                                    <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                                        All associated transactions will be permanently deleted. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            This action is permanent and cannot be undone. To confirm, please type the account name below:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={accountName}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                onOpenChange(false);
                                setConfirmText("");
                            }}
                            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={!canDelete || deleteAccount.isPending}
                            className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
