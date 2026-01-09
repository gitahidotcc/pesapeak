"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeriodFilter } from "./period-filter-dialog";

interface ActiveFiltersProps {
  filter: PeriodFilter;
  selectedAccountId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  accountName?: string;
  categoryName?: string;
  onRemoveAccount: () => void;
  onRemoveCategory: () => void;
  onRemoveSearch: () => void;
  onRemovePeriod: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filter,
  selectedAccountId,
  selectedCategoryId,
  searchQuery,
  accountName,
  categoryName,
  onRemoveAccount,
  onRemoveCategory,
  onRemoveSearch,
  onRemovePeriod,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters = Boolean(
    selectedAccountId ||
    selectedCategoryId ||
    searchQuery ||
    (filter.type !== "all")
  );

  if (!hasFilters) {
    return null;
  }

  const getPeriodLabel = (filter: PeriodFilter): string | null => {
    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      return new Date(filter.year, filter.month, 1).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
    }
    if (filter.type === "year" && filter.year !== undefined) {
      return filter.year.toString();
    }
    if (filter.type === "range" && filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }
    return null;
  };

  const periodLabel = getPeriodLabel(filter);

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      {periodLabel && (
        <FilterChip
          label={`Period: ${periodLabel}`}
          onRemove={onRemovePeriod}
        />
      )}
      {selectedAccountId && accountName && (
        <FilterChip
          label={`Account: ${accountName}`}
          onRemove={onRemoveAccount}
        />
      )}
      {selectedCategoryId && categoryName && (
        <FilterChip
          label={`Category: ${categoryName}`}
          onRemove={onRemoveCategory}
        />
      )}
      {searchQuery && (
        <FilterChip
          label={`Search: "${searchQuery}"`}
          onRemove={onRemoveSearch}
        />
      )}
      {(periodLabel || selectedAccountId || selectedCategoryId || searchQuery) && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 sm:px-3 py-1 text-xs font-medium text-foreground">
      <span className="truncate max-w-[200px] sm:max-w-none">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors touch-manipulation min-w-[20px] min-h-[20px] flex items-center justify-center"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
