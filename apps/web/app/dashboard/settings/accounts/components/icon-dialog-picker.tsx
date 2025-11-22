"use client";

import { useState } from "react";
import { Search, Check, type LucideIcon } from "lucide-react";
import {
    Banknote,
    Wallet,
    CreditCard,
    PiggyBank,
    Coins,
    Landmark,
    Building,
    Building2,
    Home,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Euro,
    Bitcoin,
    Smartphone,
    Car,
    Plane,
    Gift,
    Heart,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const ICONS: Array<{ value: string; label: string; Icon: LucideIcon; category: string }> = [
    // Banking
    { value: "banknote", label: "Banknote", Icon: Banknote, category: "Banking" },
    { value: "wallet", label: "Wallet", Icon: Wallet, category: "Banking" },
    { value: "credit-card", label: "Credit Card", Icon: CreditCard, category: "Banking" },
    { value: "piggy-bank", label: "Piggy Bank", Icon: PiggyBank, category: "Banking" },
    { value: "coins", label: "Coins", Icon: Coins, category: "Banking" },
    { value: "landmark", label: "Bank", Icon: Landmark, category: "Banking" },

    // Business
    { value: "building", label: "Building", Icon: Building, category: "Business" },
    { value: "building-2", label: "Office", Icon: Building2, category: "Business" },
    { value: "briefcase", label: "Briefcase", Icon: Briefcase, category: "Business" },

    // Personal
    { value: "home", label: "Home", Icon: Home, category: "Personal" },
    { value: "shopping-cart", label: "Shopping", Icon: ShoppingCart, category: "Personal" },
    { value: "car", label: "Car", Icon: Car, category: "Personal" },
    { value: "plane", label: "Travel", Icon: Plane, category: "Personal" },
    { value: "gift", label: "Gift", Icon: Gift, category: "Personal" },
    { value: "heart", label: "Heart", Icon: Heart, category: "Personal" },

    // Finance
    { value: "trending-up", label: "Investment", Icon: TrendingUp, category: "Finance" },
    { value: "dollar-sign", label: "Dollar", Icon: DollarSign, category: "Finance" },
    { value: "euro", label: "Euro", Icon: Euro, category: "Finance" },
    { value: "bitcoin", label: "Crypto", Icon: Bitcoin, category: "Finance" },

    // Digital
    { value: "smartphone", label: "Mobile Money", Icon: Smartphone, category: "Digital" },
];

interface IconDialogPickerProps {
    value: string;
    onSelect: (icon: string) => void;
}

export function IconDialogPicker({ value, onSelect }: IconDialogPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedIcon = ICONS.find((i) => i.value === value);

    const filteredIcons = ICONS.filter((icon) => {
        const searchLower = search.toLowerCase();
        return (
            icon.label.toLowerCase().includes(searchLower) ||
            icon.category.toLowerCase().includes(searchLower) ||
            icon.value.toLowerCase().includes(searchLower)
        );
    });

    const groupedIcons = filteredIcons.reduce((acc, icon) => {
        if (!acc[icon.category]) {
            acc[icon.category] = [];
        }
        acc[icon.category].push(icon);
        return acc;
    }, {} as Record<string, typeof ICONS>);

    const handleSelect = (iconValue: string) => {
        onSelect(iconValue);
        setOpen(false);
        setSearch("");
    };

    const SelectedIconComponent = selectedIcon?.Icon || Banknote;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <span className="flex items-center gap-2">
                        <SelectedIconComponent className="h-5 w-5" />
                        <span className="font-medium">{selectedIcon?.label || "Select icon"}</span>
                    </span>
                    <Search className="h-4 w-4 text-muted-foreground" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Icon</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                            <div key={category} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {category}
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {icons.map((icon) => {
                                        const IconComponent = icon.Icon;
                                        const isSelected = value === icon.value;
                                        return (
                                            <button
                                                key={icon.value}
                                                type="button"
                                                onClick={() => handleSelect(icon.value)}
                                                className={`group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5 ${isSelected
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border bg-background"
                                                    }`}
                                                title={icon.label}
                                            >
                                                <IconComponent className={`h-6 w-6 ${isSelected ? "text-primary" : "text-foreground"}`} />
                                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                                    {icon.label}
                                                </span>
                                                {isSelected && (
                                                    <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {filteredIcons.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No icons found
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
