"use client";

import { useState, useMemo } from "react";
import { Check, Loader2 } from "lucide-react";
import { StepComponentProps } from "@/app/onboarding/types/step-component";
import { STARTER_CATEGORIES, type StarterFolder } from "@/app/onboarding/lib/starter-categories";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
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
  type LucideIcon,
} from "lucide-react";

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

type FolderSelection = {
  folder: StarterFolder;
  selected: boolean;
  categorySelections: Record<string, boolean>;
};

export function CategoriesStep({ context }: StepComponentProps) {
  const { goToNextStep } = context;
  const utils = api.useUtils();
  const [folderSelections, setFolderSelections] = useState<FolderSelection[]>(() =>
    STARTER_CATEGORIES.map((folder) => ({
      folder,
      selected: true,
      categorySelections: folder.categories.reduce(
        (acc, cat) => ({ ...acc, [cat.name]: true }),
        {} as Record<string, boolean>
      ),
    }))
  );

  const createFolderMutation = api.categories.createFolder.useMutation();
  const createCategoryMutation = api.categories.createCategory.useMutation();
  const [isCreating, setIsCreating] = useState(false);

  const toggleFolder = (folderIndex: number) => {
    setFolderSelections((prev) => {
      const newSelections = prev.map((fs, idx) => {
        if (idx !== folderIndex) return fs;
        
        const newSelected = !fs.selected;
        const newCategorySelections = { ...fs.categorySelections };
        
        // If folder is deselected, deselect all categories
        // If folder is selected, select all categories
        Object.keys(newCategorySelections).forEach((key) => {
          newCategorySelections[key] = newSelected;
        });
        
        return {
          ...fs,
          selected: newSelected,
          categorySelections: newCategorySelections,
        };
      });
      return newSelections;
    });
  };

  const toggleCategory = (folderIndex: number, categoryName: string) => {
    setFolderSelections((prev) => {
      const newSelections = prev.map((fs, idx) => {
        if (idx !== folderIndex) return fs;
        
        const currentCategorySelection = fs.categorySelections[categoryName];
        const newCategorySelections = {
          ...fs.categorySelections,
          [categoryName]: !currentCategorySelection,
        };
        
        // If any category is selected, ensure folder is selected
        // If no categories are selected, deselect folder
        const hasSelectedCategory = Object.values(newCategorySelections).some((selected) => selected);
        
        return {
          ...fs,
          selected: hasSelectedCategory,
          categorySelections: newCategorySelections,
        };
      });
      return newSelections;
    });
  };

  const handleCreateCategories = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    const errors: string[] = [];

    try {
      // First, create all folders
      const folderPromises = folderSelections
        .filter((fs) => fs.selected)
        .map(async (fs) => {
          try {
            const result = await createFolderMutation.mutateAsync({
              name: fs.folder.name,
              icon: fs.folder.icon,
              color: fs.folder.color,
            });
            return { folderId: result.id, folderSelection: fs };
          } catch (error) {
            errors.push(`Failed to create folder "${fs.folder.name}"`);
            return null;
          }
        });

      const createdFolders = await Promise.all(folderPromises);
      const validFolders = createdFolders.filter(
        (f): f is { folderId: string; folderSelection: FolderSelection } => f !== null
      );

      // Then, create all categories
      const categoryPromises = validFolders.flatMap(({ folderId, folderSelection }) => {
        const selectedCategories = folderSelection.folder.categories.filter(
          (cat) => folderSelection.categorySelections[cat.name]
        );

        return selectedCategories.map(async (category) => {
          try {
            await createCategoryMutation.mutateAsync({
              folderId,
              name: category.name,
              icon: category.icon || "banknote",
              color: category.color || "#222222",
            });
          } catch (error) {
            errors.push(`Failed to create category "${category.name}" in folder "${folderSelection.folder.name}"`);
          }
        });
      });

      await Promise.all(categoryPromises);

      // Invalidate categories list to refresh
      await utils.categories.list.invalidate();

      if (errors.length > 0) {
        toast.error(`Some categories failed to create: ${errors.join(", ")}`);
      } else {
        toast.success("Categories created successfully!");
        // Navigate to success step
        goToNextStep();
      }
    } catch (error) {
      toast.error("Failed to create categories. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCount = useMemo(() => {
    return folderSelections.reduce((count, fs) => {
      if (!fs.selected) return count;
      return count + Object.values(fs.categorySelections).filter(Boolean).length;
    }, 0);
  }, [folderSelections]);

  const FolderIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Banknote;
    return Icon;
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 3 · Setup categories</p>
        <h2 className="text-2xl font-bold text-card-foreground">Choose your starter categories</h2>
        <p className="text-sm text-muted-foreground">
          We've prepared some common categories to get you started. Select the ones you want to use.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        {folderSelections.map((folderSelection, folderIndex) => {
          const FolderIconComponent = FolderIcon(folderSelection.folder.icon);
          const selectedCategoriesCount = Object.values(folderSelection.categorySelections).filter(Boolean).length;
          const totalCategoriesCount = folderSelection.folder.categories.length;

          return (
            <div
              key={folderSelection.folder.name}
              className="rounded-xl border border-border bg-card/50 p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleFolder(folderIndex)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: folderSelection.folder.color + "20", color: folderSelection.folder.color }}
                  >
                    <FolderIconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-card-foreground">{folderSelection.folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCategoriesCount} of {totalCategoriesCount} categories selected
                    </p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      folderSelection.selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    }`}
                  >
                    {folderSelection.selected && <Check className="h-3 w-3" />}
                  </div>
                </button>
              </div>

              {folderSelection.selected && (
                <div className="mt-3 grid gap-2 pl-12 sm:grid-cols-2 lg:grid-cols-3">
                  {folderSelection.folder.categories.map((category) => {
                    const isSelected = folderSelection.categorySelections[category.name];
                    return (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => toggleCategory(folderIndex, category.name)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5 text-card-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        <span className="text-sm">{category.name}</span>
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        <p>
          {selectedCount > 0 ? (
            <>
              <span className="font-semibold text-foreground">{selectedCount}</span> categories will be created. You
              can add more later.
            </>
          ) : (
            <>No categories selected. You can add categories later from the settings page.</>
          )}
        </p>
      </div>

      {selectedCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateCategories}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating categories...
              </>
            ) : (
              "Create Categories"
            )}
          </button>
        </div>
      )}
    </section>
  );
}

