"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconDialogPicker } from "@/components/shared/icon-picker/icon-dialog-picker";
import { ColorDialogPicker } from "@/components/shared/color-picker/color-dialog-picker";
import type { Folder } from "../types/categories";

interface AddCategoryStandaloneDialogProps {
    folders: Folder[];
    onAdd: (folderId: string, data: { name: string; icon: string; color: string }) => void;
}

export function AddCategoryStandaloneDialog({ folders, onAdd }: AddCategoryStandaloneDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("banknote");
    const [color, setColor] = useState("#222222");
    const [selectedFolderId, setSelectedFolderId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !selectedFolderId) return;

        onAdd(selectedFolderId, { name: name.trim(), icon, color });
        setName("");
        setIcon("banknote");
        setColor("#222222");
        setSelectedFolderId("");
        setOpen(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setName("");
            setIcon("banknote");
            setColor("#222222");
            setSelectedFolderId("");
        }
    };

    const hasFolders = folders.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={!hasFolders}>
                    <Plus className="h-4 w-4" />
                    Create Category
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>

                {!hasFolders ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Please create a folder first before adding categories.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="standalone-category-folder"
                                className="text-sm font-semibold text-foreground"
                            >
                                Folder *
                            </label>
                            <select
                                id="standalone-category-folder"
                                value={selectedFolderId}
                                onChange={(e) => setSelectedFolderId(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="">Select a folder</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="standalone-category-name"
                                className="text-sm font-semibold text-foreground"
                            >
                                Category Name *
                            </label>
                            <input
                                id="standalone-category-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Groceries"
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                autoFocus
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
                                onClick={() => handleOpenChange(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                            >
                                Create Category
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

