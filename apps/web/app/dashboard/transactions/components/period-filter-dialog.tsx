"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PeriodType = "month" | "year" | "range";

export interface PeriodFilter {
  type: PeriodType;
  month?: number; // 0-11
  year?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

interface PeriodFilterDialogProps {
  filter: PeriodFilter;
  onFilterChange: (filter: PeriodFilter) => void;
  availableMonths: Array<{ year: number; month: number }>;
  availableYears: number[];
}

export function PeriodFilterDialog({
  filter,
  onFilterChange,
  availableMonths,
  availableYears,
}: PeriodFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PeriodType>(filter.type);

  const monthsByYear = useMemo(() => {
    const grouped: Record<number, number[]> = {};
    availableMonths.forEach(({ year, month }) => {
      if (!grouped[year]) {
        grouped[year] = [];
      }
      if (!grouped[year].includes(month)) {
        grouped[year].push(month);
      }
    });
    // Sort months within each year
    Object.keys(grouped).forEach((year) => {
      grouped[Number(year)].sort((a, b) => b - a); // Most recent first
    });
    return grouped;
  }, [availableMonths]);

  const sortedYears = useMemo(() => {
    return [...availableYears].sort((a, b) => b - a); // Most recent first
  }, [availableYears]);

  const handleMonthSelect = (year: number, month: number) => {
    onFilterChange({ type: "month", month, year });
    setOpen(false);
  };

  const handleYearSelect = (year: number) => {
    onFilterChange({ type: "year", year });
    setOpen(false);
  };

  const handleRangeApply = () => {
    if (filter.startDate && filter.endDate) {
      onFilterChange({
        type: "range",
        startDate: filter.startDate,
        endDate: filter.endDate,
      });
      setOpen(false);
    }
  };

  const getFilterLabel = () => {
    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      const date = new Date(filter.year, filter.month, 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (filter.type === "year" && filter.year !== undefined) {
      return filter.year.toString();
    }
    if (filter.type === "range" && filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return "Select Period";
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span>{getFilterLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Period</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("month")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === "month"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("year")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === "year"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Year
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("range")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === "range"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Date Range
            </button>
          </div>

          {/* Month Tab */}
          {activeTab === "month" && (
            <div className="max-h-[400px] space-y-4 overflow-y-auto">
              {Object.keys(monthsByYear).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                Object.entries(monthsByYear)
                  .sort((a, b) => Number(b[0]) - Number(a[0])) // Most recent year first
                  .map(([year, months]) => (
                    <div key={year} className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {year}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {months.map((month) => {
                          const isSelected =
                            filter.type === "month" &&
                            filter.month === month &&
                            filter.year === Number(year);
                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() => handleMonthSelect(Number(year), month)}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-sm transition-colors",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background hover:bg-muted"
                              )}
                            >
                              {monthNames[month]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Year Tab */}
          {activeTab === "year" && (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {sortedYears.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                sortedYears.map((year) => {
                  const isSelected = filter.type === "year" && filter.year === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={cn(
                        "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      {year}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Date Range Tab */}
          {activeTab === "range" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  From Date
                </label>
                <input
                  type="date"
                  value={filter.startDate || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filter,
                      type: "range",
                      startDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  To Date
                </label>
                <input
                  type="date"
                  value={filter.endDate || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filter,
                      type: "range",
                      endDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleRangeApply}
                disabled={!filter.startDate || !filter.endDate}
                className="w-full"
              >
                Apply Filter
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

