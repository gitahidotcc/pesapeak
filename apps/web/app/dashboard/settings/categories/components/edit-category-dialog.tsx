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
import type { Category } from "../types/categories";

interface EditCategoryDialogProps {
    category: Category | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (category: Category, data: { name: string; icon: string; color: string }) => void;
}

export function EditCategoryDialog({
    category,
    open,
    onOpenChange,
    onSave,
}: EditCategoryDialogProps) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("banknote");
    const [color, setColor] = useState("#222222");

    useEffect(() => {
        if (category) {
            setName(category.name);
            setIcon(category.icon);
            setColor(category.color);
        }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !name.trim()) return;

        onSave(category, { name: name.trim(), icon, color });
        onOpenChange(false);
    };

    if (!category) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Edit Category
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="edit-category-name"
                            className="text-sm font-semibold text-foreground"
                        >
                            Category Name *
                        </label>
                        <input
                            id="edit-category-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Groceries"
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

