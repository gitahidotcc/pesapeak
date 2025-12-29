"use client";

import { useState } from "react";
import { Search, Check, Palette } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const COLORS: Array<{ value: string; label: string; category: string }> = [
    // Neutrals
    { value: "#0f172a", label: "Night", category: "Neutrals" },
    { value: "#1d1d1f", label: "Midnight", category: "Neutrals" },
    { value: "#222222", label: "Graphite", category: "Neutrals" },
    { value: "#374151", label: "Slate", category: "Neutrals" },
    { value: "#6b7280", label: "Gray", category: "Neutrals" },

    // Blues
    { value: "#1e40af", label: "Royal Blue", category: "Blues" },
    { value: "#2563eb", label: "Serene Blue", category: "Blues" },
    { value: "#3b82f6", label: "Sky Blue", category: "Blues" },
    { value: "#0ea5e9", label: "Bright Blue", category: "Blues" },
    { value: "#06b6d4", label: "Cyan", category: "Blues" },

    // Greens
    { value: "#065f46", label: "Forest Green", category: "Greens" },
    { value: "#059669", label: "Emerald", category: "Greens" },
    { value: "#10b981", label: "Green", category: "Greens" },
    { value: "#16a34a", label: "Growth Green", category: "Greens" },
    { value: "#22c55e", label: "Lime", category: "Greens" },

    // Oranges & Reds
    { value: "#c2410c", label: "Burnt Orange", category: "Warm" },
    { value: "#ea580c", label: "Orange", category: "Warm" },
    { value: "#f97316", label: "Sunbeam", category: "Warm" },
    { value: "#fb923c", label: "Peach", category: "Warm" },
    { value: "#dc2626", label: "Red", category: "Warm" },
    { value: "#ef4444", label: "Bright Red", category: "Warm" },

    // Purples & Pinks
    { value: "#7c3aed", label: "Purple", category: "Vibrant" },
    { value: "#8b5cf6", label: "Violet", category: "Vibrant" },
    { value: "#a855f7", label: "Lavender", category: "Vibrant" },
    { value: "#d946ef", label: "Fuchsia", category: "Vibrant" },
    { value: "#ec4899", label: "Pink", category: "Vibrant" },
    { value: "#f43f5e", label: "Rose", category: "Vibrant" },

    // Yellows
    { value: "#ca8a04", label: "Gold", category: "Bright" },
    { value: "#eab308", label: "Yellow", category: "Bright" },
    { value: "#facc15", label: "Bright Yellow", category: "Bright" },
    { value: "#fbbf24", label: "Amber", category: "Bright" },
];

interface ColorDialogPickerProps {
    value: string;
    onSelect: (color: string) => void;
}

export function ColorDialogPicker({ value, onSelect }: ColorDialogPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedColor = COLORS.find((c) => c.value === value);

    const filteredColors = COLORS.filter((color) => {
        const searchLower = search.toLowerCase();
        return (
            color.label.toLowerCase().includes(searchLower) ||
            color.category.toLowerCase().includes(searchLower) ||
            color.value.toLowerCase().includes(searchLower)
        );
    });

    const groupedColors = filteredColors.reduce((acc, color) => {
        if (!acc[color.category]) {
            acc[color.category] = [];
        }
        acc[color.category].push(color);
        return acc;
    }, {} as Record<string, typeof COLORS>);

    const handleSelect = (colorValue: string) => {
        onSelect(colorValue);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <span className="flex items-center gap-2">
                        <span
                            className="h-5 w-5 rounded-full border border-border"
                            style={{ backgroundColor: value }}
                        />
                        <span className="font-medium">{selectedColor?.label || "Select color"}</span>
                        <span className="text-xs text-muted-foreground">{value}</span>
                    </span>
                    <Palette className="h-4 w-4 text-muted-foreground" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Color</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search colors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                        {Object.entries(groupedColors).map(([category, colors]) => (
                            <div key={category} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {category}
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {colors.map((color) => {
                                        const isSelected = value === color.value;
                                        return (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => handleSelect(color.value)}
                                                className={`group relative flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5 ${isSelected
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border bg-background"
                                                    }`}
                                                title={color.value}
                                            >
                                                <span
                                                    className="h-8 w-8 flex-shrink-0 rounded-full border border-border shadow-sm"
                                                    style={{ backgroundColor: color.value }}
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-foreground">{color.label}</p>
                                                    <p className="text-xs text-muted-foreground">{color.value}</p>
                                                </div>
                                                {isSelected && (
                                                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {filteredColors.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No colors found
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

