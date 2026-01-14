"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TransactionsSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount?: number;
}

export function TransactionsSearchDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  resultCount,
}: TransactionsSearchDialogProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    if (open) {
      setLocalQuery(searchQuery);
      // Focus input when dialog opens
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          '[data-search-input]'
        );
        input?.focus();
      }, 100);
    }
  }, [open, searchQuery]);

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setLocalQuery("");
    onSearchChange("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Search Transactions</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-search-input
              type="text"
              placeholder="Search by notes, category, account..."
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10 pr-10 h-11"
            />
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {localQuery && resultCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {resultCount === 0 ? (
                <span>No transactions found</span>
              ) : (
                <span>
                  Found {resultCount} {resultCount === 1 ? "transaction" : "transactions"}
                </span>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Search tips:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Search by transaction notes, category names, or account names</li>
              <li>Use keywords to find specific transactions quickly</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
