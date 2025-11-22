"use client";

import type React from "react";
import { Pencil, Trash2, type LucideIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import type { Category } from "../types/categories";

// Highlight matching text in search results
const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let index = textLower.indexOf(queryLower, lastIndex);

    while (index !== -1) {
        // Add text before the match
        if (index > lastIndex) {
            parts.push(text.slice(lastIndex, index));
        }
        // Add the highlighted match
        parts.push(
            <mark
                key={index}
                className="bg-primary/20 text-primary-foreground rounded px-0.5"
            >
                {text.slice(index, index + query.length)}
            </mark>
        );
        lastIndex = index + query.length;
        index = textLower.indexOf(queryLower, lastIndex);
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
};

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

interface CategoryItemProps {
    category: Category;
    searchQuery?: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onClick?: (category: Category) => void;
}

export function CategoryItem({ category, searchQuery = "", onEdit, onDelete, onClick }: CategoryItemProps) {
    const Icon = ICON_MAP[category.icon] || Banknote;

    return (
        <div 
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm cursor-pointer"
            onClick={() => onClick?.(category)}
        >
            <div className="flex items-center gap-3 flex-1">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    <Icon
                        className="h-5 w-5"
                        style={{ color: category.color }}
                    />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-foreground">
                        {highlightText(category.name, searchQuery)}
                    </h4>
                </div>
            </div>
            <div 
                className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(category);
                    }}
                    aria-label={`Edit ${category.name}`}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(category);
                    }}
                    className="border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${category.name}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

