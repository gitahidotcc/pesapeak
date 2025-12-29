"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
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

interface CreateFolderDialogProps {
    onCreate: (data: { name: string; icon: string; color: string }) => void;
}

export function CreateFolderDialog({ onCreate }: CreateFolderDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("banknote");
    const [color, setColor] = useState("#222222");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onCreate({ name: name.trim(), icon, color });
        setName("");
        setIcon("banknote");
        setColor("#222222");
        setOpen(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setName("");
            setIcon("banknote");
            setColor("#222222");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FolderPlus className="h-4 w-4" />
                    Create Folder
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Folder</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="folder-name"
                            className="text-sm font-semibold text-foreground"
                        >
                            Folder Name *
                        </label>
                        <input
                            id="folder-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Essentials"
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
                            Create Folder
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

