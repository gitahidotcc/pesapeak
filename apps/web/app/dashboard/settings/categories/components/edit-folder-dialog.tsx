"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconDialogPicker } from "@/components/shared/icon-picker/icon-dialog-picker";
import { ColorDialogPicker } from "@/components/shared/color-picker/color-dialog-picker";
import type { Folder } from "../types/categories";

interface EditFolderDialogProps {
    folder: Folder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (folder: Folder, data: { name: string; icon: string; color: string }) => void;
}

export function EditFolderDialog({
    folder,
    open,
    onOpenChange,
    onSave,
}: EditFolderDialogProps) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("banknote");
    const [color, setColor] = useState("#222222");

    useEffect(() => {
        if (folder) {
            setName(folder.name);
            setIcon(folder.icon);
            setColor(folder.color);
        }
    }, [folder]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!folder || !name.trim()) return;

        onSave(folder, { name: name.trim(), icon, color });
        onOpenChange(false);
    };

    if (!folder) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Folder
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="edit-folder-name"
                            className="text-sm font-semibold text-foreground"
                        >
                            Folder Name *
                        </label>
                        <input
                            id="edit-folder-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Essentials"
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

