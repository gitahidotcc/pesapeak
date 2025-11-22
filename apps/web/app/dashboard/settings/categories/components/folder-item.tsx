"use client";

import { useState } from "react";
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
import { CategoryItem } from "./category-item";
import { AddCategoryDialog } from "./add-category-dialog";
import { EditFolderDialog } from "./edit-folder-dialog";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { CategoryActionsSheet } from "./category-actions-sheet";
import type { Folder, Category } from "../types/categories";

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

interface FolderItemProps {
    folder: Folder;
    searchQuery?: string;
    onEditFolder: (folder: Folder, data: { name: string; icon: string; color: string }) => void;
    onDeleteFolder: (folder: Folder) => void;
    onAddCategory: (folderId: string, data: { name: string; icon: string; color: string }) => void;
    onEditCategory: (category: Category, data: { name: string; icon: string; color: string }) => void;
    onDeleteCategory: (category: Category) => void;
}

export function FolderItem({
    folder,
    searchQuery = "",
    onEditFolder,
    onDeleteFolder,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
}: FolderItemProps) {
    const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
    const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [categoryActionsOpen, setCategoryActionsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const Icon = ICON_MAP[folder.icon] || Banknote;

    const handleEditFolder = (folder: Folder, data: { name: string; icon: string; color: string }) => {
        onEditFolder(folder, data);
    };

    const handleDeleteFolder = (folder: Folder) => {
        onDeleteFolder(folder);
    };

    const handleAddCategory = (folderId: string, data: { name: string; icon: string; color: string }) => {
        onAddCategory(folderId, data);
    };

    const handleEditCategory = (category: Category, data: { name: string; icon: string; color: string }) => {
        onEditCategory(category, data);
    };

    const handleDeleteCategory = (category: Category) => {
        onDeleteCategory(category);
    };

    return (
        <>
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                {/* Folder Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${folder.color}20` }}
                        >
                            <Icon
                                className="h-6 w-6"
                                style={{ color: folder.color }}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                {highlightText(folder.name, searchQuery)}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {folder.categories.length} categor{folder.categories.length !== 1 ? "ies" : "y"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingFolder(folder)}
                            aria-label={`Edit ${folder.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingFolder(folder)}
                            className="border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
                            aria-label={`Delete ${folder.name}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Categories List */}
                <div className="space-y-2">
                    {folder.categories.length > 0 ? (
                        folder.categories.map((category) => (
                            <CategoryItem
                                key={category.id}
                                category={category}
                                searchQuery={searchQuery}
                                onEdit={(cat) => setEditingCategory(cat)}
                                onDelete={(cat) => setDeletingCategory(cat)}
                                onClick={(cat) => {
                                    setSelectedCategory(cat);
                                    setCategoryActionsOpen(true);
                                }}
                            />
                        ))
                    ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            No categories yet
                        </p>
                    )}
                </div>

                {/* Add Category Dialog */}
                <AddCategoryDialog
                    folderId={folder.id}
                    onAdd={(data) => handleAddCategory(folder.id, data)}
                />
            </div>

            {/* Dialogs */}
            <EditFolderDialog
                folder={editingFolder}
                open={!!editingFolder}
                onOpenChange={(open) => !open && setEditingFolder(null)}
                onSave={handleEditFolder}
            />

            <DeleteFolderDialog
                folder={deletingFolder}
                open={!!deletingFolder}
                onOpenChange={(open) => !open && setDeletingFolder(null)}
                onDelete={handleDeleteFolder}
            />

            <EditCategoryDialog
                category={editingCategory}
                open={!!editingCategory}
                onOpenChange={(open) => !open && setEditingCategory(null)}
                onSave={handleEditCategory}
            />

            <DeleteCategoryDialog
                category={deletingCategory}
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                onDelete={handleDeleteCategory}
            />

            <CategoryActionsSheet
                category={selectedCategory}
                open={categoryActionsOpen}
                onOpenChange={(open) => {
                    setCategoryActionsOpen(open);
                    if (!open) setSelectedCategory(null);
                }}
                onEdit={(cat) => setEditingCategory(cat)}
                onDelete={(cat) => setDeletingCategory(cat)}
                onShowTransactions={(cat) => {
                    // TODO: Implement show transactions
                    console.log("Show transactions for:", cat.name);
                }}
            />
        </>
    );
}

