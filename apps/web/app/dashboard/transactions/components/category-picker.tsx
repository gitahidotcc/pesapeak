"use client";

import { useState } from "react";
import { Search, Check, Banknote, type LucideIcon } from "lucide-react";
import {
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
import { cn } from "@/lib/utils";

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

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  folderId: string;
  folderName?: string;
  folderColor?: string;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  error?: string;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  error,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const Icon = selectedCategory ? ICON_MAP[selectedCategory.icon] || Banknote : Banknote;

  const filteredCategories = categories.filter((category) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    const categoryName = category.name.toLowerCase();
    const folderName = (category.folderName || "").toLowerCase();
    return categoryName.includes(searchLower) || folderName.includes(searchLower);
  });

  // Group filtered categories by folder
  const categoriesByFolder = filteredCategories.reduce((acc, cat) => {
    const folderName = cat.folderName || "Other";
    if (!acc[folderName]) {
      acc[folderName] = [];
    }
    acc[folderName].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Category
      </label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              error && "border-destructive",
              "flex items-center justify-between"
            )}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${selectedCategory.color}20` }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: selectedCategory.color }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{selectedCategory.name}</span>
                  {selectedCategory.folderName && (
                    <span className="text-xs text-muted-foreground">
                      {selectedCategory.folderName}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a category</span>
            )}
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
              {filteredCategories.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {categories.length === 0 ? "No categories available" : "No categories found"}
                </div>
              ) : (
                Object.entries(categoriesByFolder).map(([folderName, folderCategories]) => (
                  <div key={folderName} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {folderName}
                    </p>
                    <div className="space-y-1">
                      {folderCategories.map((category) => {
                        const CategoryIcon = ICON_MAP[category.icon] || Banknote;
                        const isSelected = selectedCategoryId === category.id;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleSelect(category.id)}
                            className={cn(
                              "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted",
                              isSelected ? "border-primary bg-primary/5" : "border-border bg-background",
                              "flex items-center gap-3"
                            )}
                          >
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <CategoryIcon
                                className="h-5 w-5"
                                style={{ color: category.color }}
                              />
                            </div>
                            <span className="flex-1 font-medium">{category.name}</span>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
