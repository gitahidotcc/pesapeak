"use client";

import { Pencil, FileText, Trash2, X, type LucideIcon } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Category } from "../types/categories";

const ICON_MAP: Record<string, LucideIcon> = {
    banknote: Banknote,
    wallet: Wallet,
    "credit-card": CreditCard,
    "piggy-bank": PiggyBank,
    coins: Coins,
    landmark: Landmark,
    building: Building,
    "building-2": Building2,
    home: Home,
    briefcase: Briefcase,
    "shopping-cart": ShoppingCart,
    "trending-up": TrendingUp,
    "dollar-sign": DollarSign,
    euro: Euro,
    bitcoin: Bitcoin,
    smartphone: Smartphone,
    car: Car,
    plane: Plane,
    gift: Gift,
    heart: Heart,
};

interface CategoryActionsSheetProps {
    category: Category | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onShowTransactions: (category: Category) => void;
}

export function CategoryActionsSheet({
    category,
    open,
    onOpenChange,
    onEdit,
    onDelete,
    onShowTransactions,
}: CategoryActionsSheetProps) {
    if (!category) return null;

    const Icon = ICON_MAP[category.icon] || Banknote;

    const handleAction = (action: () => void) => {
        action();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 sm:rounded-lg md:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%] fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 sm:translate-y-[-50%] sm:translate-x-[-50%] sm:left-[50%] sm:top-[50%] sm:bottom-auto rounded-t-2xl sm:rounded-t-lg border-b-0 sm:border-b sm:rounded-b-lg">
                {/* Mobile: Bottom sheet style */}
                <div className="flex flex-col sm:hidden max-h-[80vh] overflow-y-auto">
                    {/* Handle bar for mobile */}
                    <div className="flex items-center justify-center pt-3 pb-2">
                        <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
                    </div>

                    {/* Category info */}
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: category.color }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {category.name}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border px-4 py-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto"
                            onClick={() => handleAction(() => onShowTransactions(category))}
                        >
                            <FileText className="h-5 w-5" />
                            Show Transactions
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto"
                            onClick={() => handleAction(() => onEdit(category))}
                        >
                            <Pencil className="h-5 w-5" />
                            Edit Category
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto text-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(() => onDelete(category))}
                        >
                            <Trash2 className="h-5 w-5" />
                            Delete Category
                        </Button>
                    </div>

                    {/* Cancel button */}
                    <div className="border-t border-border p-4">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Desktop: Menu style */}
                <div className="hidden flex-col sm:flex">
                    <div className="p-4">
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: category.color }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {category.name}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto"
                                onClick={() => handleAction(() => onShowTransactions(category))}
                            >
                                <FileText className="h-4 w-4" />
                                Show Transactions
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto"
                                onClick={() => handleAction(() => onEdit(category))}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Category
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-3 py-2 h-auto text-destructive hover:bg-destructive/10"
                                onClick={() => handleAction(() => onDelete(category))}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Category
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

