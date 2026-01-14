"use client";

import { FileX, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddTransaction?: () => void;
  searchQuery?: string;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onAddTransaction,
  searchQuery,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted/50 mb-4 sm:mb-6">
        <FileX className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
        {searchQuery
          ? "No transactions found"
          : hasFilters
            ? "No transactions match your filters"
            : "No transactions yet"}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {searchQuery
          ? `No transactions found matching "${searchQuery}". Try a different search term or clear your search.`
          : hasFilters
            ? "Try adjusting your filters or clear them to see all transactions."
            : "Get started by adding your first transaction to track your finances."}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="gap-2 h-10 sm:h-auto touch-manipulation"
            size="sm"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Filters</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        )}
        {onAddTransaction && (
          <Button
            onClick={onAddTransaction}
            className="gap-2 h-10 sm:h-auto touch-manipulation"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </div>
  );
}
