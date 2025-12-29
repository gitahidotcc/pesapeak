"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Folder } from "../types/categories";

interface DeleteFolderDialogProps {
    folder: Folder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (folder: Folder) => void;
}

export function DeleteFolderDialog({
    folder,
    open,
    onOpenChange,
    onDelete,
}: DeleteFolderDialogProps) {
    const [confirmText, setConfirmText] = useState("");

    const canDelete = confirmText === folder?.name;
    const categoryCount = folder?.categories.length ?? 0;

    const handleDelete = () => {
        if (!folder || !canDelete) return;
        onDelete(folder);
        setConfirmText("");
        onOpenChange(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setConfirmText("");
        }
        onOpenChange(newOpen);
    };

    if (!folder) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Folder
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <p className="text-sm font-medium text-foreground">
                            You are about to delete:
                        </p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                            {folder.name}
                        </p>
                    </div>

                    {categoryCount > 0 && (
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                        Warning: This folder contains {categoryCount} categor{categoryCount !== 1 ? "ies" : "y"}
                                    </p>
                                    <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">
                                        All categories inside this folder will be permanently deleted. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            This action is permanent and cannot be undone. To confirm, please type the folder name below:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={folder.name}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!canDelete}
                            className="flex-1"
                        >
                            Delete Folder
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

