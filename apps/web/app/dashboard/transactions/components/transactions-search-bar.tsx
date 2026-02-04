"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
  resultCount?: number;
}

export function TransactionsSearchBar({
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
  resultCount,
}: TransactionsSearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useLayoutEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setLocalQuery("");
    onSearchChange("");
    if (!searchQuery) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
      onClose();
    }
  };

  // Show search bar if it's open OR if there's an active search query
  const shouldShow = isOpen || searchQuery;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by notes, category, account..."
          value={localQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-24 h-11 text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {localQuery && resultCount !== undefined && (
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-muted/60 whitespace-nowrap">
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
          )}
          {localQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {localQuery && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Searching in transaction notes, category names, and account names</p>
        </div>
      )}
    </div>
  );
}
