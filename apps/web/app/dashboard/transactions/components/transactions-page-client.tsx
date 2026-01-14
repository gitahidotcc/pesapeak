"use client";

import { useState, useMemo, forwardRef, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Search,
  Sparkles,
  Plus,
} from "lucide-react";
import { api } from "@/lib/trpc";
import { type PeriodFilter } from "./period-filter-dialog";
import { TransactionsFilterDialog } from "./transactions-filter-dialog";
import { TransactionsList } from "./transactions-list";
import { TransactionsSearchBar } from "./transactions-search-bar";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { ActiveFilters } from "./active-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const formatCurrency = (amount: number, currency: string = "USD") => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100); // Amount is in cents
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
};

interface TransactionsPageClientProps {
  initialAccountId?: string | null;
  initialCategoryId?: string | null;
}

export function TransactionsPageClient({
  initialAccountId = null,
  initialCategoryId = null
}: TransactionsPageClientProps) {
  // Default to current month
  const now = new Date();
  const [filter, setFilter] = useState<PeriodFilter>({
    type: "month",
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialAccountId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [resultCount, setResultCount] = useState<number | undefined>(undefined);

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: folders } = api.categories.list.useQuery();

  // Build query parameters based on filter
  const queryParams = useMemo(() => {
    const params: {
      type?: "income" | "expense" | "transfer";
      startDate?: string;
      endDate?: string;
      accountId?: string;
    } = {};

    if (filter.type === "month" && filter.month !== undefined && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      // Start: first day of the month at 00:00:00 UTC
      const startDate = new Date(Date.UTC(filter.year, filter.month, 1, 0, 0, 0, 0));
      // End: last day of the month at 23:59:59.999 UTC
      // Using month + 1 with day 0 gives us the last day of the current month
      const endDate = new Date(Date.UTC(filter.year, filter.month + 1, 0, 23, 59, 59, 999));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "year" && filter.year !== undefined) {
      // Use UTC to avoid timezone issues
      // Start: January 1st at 00:00:00 UTC
      const startDate = new Date(Date.UTC(filter.year, 0, 1, 0, 0, 0, 0));
      // End: December 31st at 23:59:59.999 UTC
      const endDate = new Date(Date.UTC(filter.year, 11, 31, 23, 59, 59, 999));
      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];
    } else if (filter.type === "range" && filter.startDate && filter.endDate) {
      params.startDate = filter.startDate;
      params.endDate = filter.endDate;
    }

    if (selectedAccountId) {
      params.accountId = selectedAccountId;
    }

    return params;
  }, [filter, selectedAccountId]);

  const { data: summaryData } = api.transactions.summary.useQuery(queryParams);

  const income = summaryData?.income ?? 0;
  const expenses = summaryData?.expenses ?? 0;

  const currency = accounts?.[0]?.currency || "USD";
  const netAmount = income - expenses;

  const summaryPresenters = useMemo(() => {
    const totalFlow = income + expenses;
    const incomeShare = totalFlow > 0 ? Math.round((income / totalFlow) * 100) : 0;
    const expenseShare = totalFlow > 0 ? Math.round((expenses / totalFlow) * 100) : 0;
    const netLabel =
      netAmount > 0
        ? "You're net positive this period"
        : netAmount < 0
          ? "Spending is higher than income"
          : "You're breaking even";

    return {
      periodLabel: getPeriodLabel(filter),
      incomeShare,
      expenseShare,
      netLabel,
    };
  }, [filter, income, expenses, netAmount]);

  const activeFilterCount =
    (filter.type === "all" ? 0 : 1) + (selectedAccountId ? 1 : 0) + (searchQuery ? 1 : 0);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-8">
      <TransactionsHeader
        periodLabel={summaryPresenters.periodLabel}
        periodTrigger={
          accounts && accounts.length > 0 ? (
            <TransactionsFilterDialog
              periodFilter={filter}
              onPeriodFilterChange={setFilter}
              selectedAccountId={selectedAccountId}
              onAccountChange={setSelectedAccountId}
              accounts={accounts}
              trigger={
                <PeriodPill
                  label={summaryPresenters.periodLabel}
                  badgeCount={activeFilterCount}
                />
              }
            />
          ) : null
        }
        onSearchClick={() => {
          setIsSearchOpen((prev) => !prev);
        }}
        searchQuery={searchQuery}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      <TransactionsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          if (!searchQuery) {
            setSearchQuery("");
          }
        }}
        resultCount={resultCount}
      />

      <SummaryHero
        currency={currency}
        income={income}
        expenses={expenses}
        netAmount={netAmount}
        netLabel={summaryPresenters.netLabel}
        incomeShare={summaryPresenters.incomeShare}
        expenseShare={summaryPresenters.expenseShare}
        periodLabel={summaryPresenters.periodLabel}
      />

      <ActiveFilters
        filter={filter}
        selectedAccountId={selectedAccountId}
        selectedCategoryId={selectedCategoryId}
        searchQuery={searchQuery}
        accountName={accounts?.find(acc => acc.id === selectedAccountId)?.name}
        categoryName={folders?.flatMap(f => f.categories).find(cat => cat.id === selectedCategoryId)?.name}
        onRemoveAccount={() => setSelectedAccountId(null)}
        onRemoveCategory={() => setSelectedCategoryId(null)}
        onRemoveSearch={() => setSearchQuery("")}
        onRemovePeriod={() => {
          const now = new Date();
          setFilter({ type: "month", month: now.getMonth(), year: now.getFullYear() });
        }}
        onClearAll={() => {
          const now = new Date();
          setFilter({ type: "month", month: now.getMonth(), year: now.getFullYear() });
          setSelectedAccountId(null);
          setSelectedCategoryId(null);
          setSearchQuery("");
        }}
      />

      <TransactionsList
        filter={filter}
        selectedAccountId={selectedAccountId}
        selectedCategoryId={selectedCategoryId}
        searchQuery={searchQuery}
        onAddTransaction={() => setIsAddDialogOpen(true)}
        onClearFilters={() => {
          setFilter({ type: "month", month: now.getMonth(), year: now.getFullYear() });
          setSelectedAccountId(null);
          setSelectedCategoryId(null);
          setSearchQuery("");
        }}
        onResultCountChange={setResultCount}
      />


      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

function getPeriodLabel(filter: PeriodFilter) {
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
  return "All time";
}

interface TransactionsHeaderProps {
  periodLabel: string;
  periodTrigger: ReactNode | null;
  onSearchClick: () => void;
  searchQuery: string;
  onAddClick: () => void;
}

function TransactionsHeader({ periodLabel, periodTrigger, onSearchClick, searchQuery, onAddClick }: TransactionsHeaderProps) {
  return (
    <header className="space-y-4">
      {periodTrigger ?? (
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1 text-sm font-medium text-primary">
          <CalendarDays className="h-4 w-4" />
          <span>{periodLabel}</span>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-foreground">Transactions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor all your financial activity in one place
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderIconButton
            icon={<Search className="h-5 w-5" />}
            label="Search transactions"
            onClick={onSearchClick}
            badgeCount={searchQuery ? 1 : 0}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <Button
            onClick={onAddClick}
            className="gap-2 h-10 sm:h-auto hidden sm:flex"
            size="default"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

interface HeaderIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  badgeCount?: number;
}

function HeaderIconButton({ icon, label, badgeCount = 0, className, ...props }: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/60 text-foreground shadow-sm transition hover:border-primary/50 hover:text-primary",
        props.disabled || props["aria-disabled"] ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        className
      )}
      {...props}
    >
      {icon}
      {badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
          {badgeCount}
        </span>
      )}
    </button>
  );
}

interface SummaryHeroProps {
  currency: string;
  income: number;
  expenses: number;
  netAmount: number;
  netLabel: string;
  incomeShare: number;
  expenseShare: number;
  periodLabel: string;
}

function SummaryHero({
  currency,
  income,
  expenses,
  netAmount,
  netLabel,
  incomeShare,
  expenseShare,
  periodLabel,
}: SummaryHeroProps) {
  const netPositive = netAmount >= 0;

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          label="Income"
          amount={formatCurrency(income, currency)}
          share={incomeShare}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          accent="from-emerald-500/10 to-emerald-600/10"
        />
        <SummaryTile
          label="Expenses"
          amount={formatCurrency(expenses, currency)}
          share={expenseShare}
          icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
          accent="from-rose-500/10 to-rose-600/10"
        />
        <SummaryTile
          label="Net"
          amount={formatCurrency(Math.abs(netAmount), currency)}
          share={0}
          icon={
            netPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )
          }
          accent={netPositive ? "from-emerald-500/10 to-emerald-600/10" : "from-rose-500/10 to-rose-600/10"}
          netAmount={netAmount}
          netLabel={netLabel}
          showNet={true}
        />
      </div>
    </section>
  );
}

interface SummaryTileProps {
  label: string;
  amount: string;
  share: number;
  icon: ReactNode;
  accent: string;
  netAmount?: number;
  netLabel?: string;
  showNet?: boolean;
}

function SummaryTile({ label, amount, share, icon, accent, netAmount, netLabel, showNet }: SummaryTileProps) {
  const isNet = showNet && netAmount !== undefined;
  const isPositive = isNet && netAmount >= 0;
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn("inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br", accent)}>
          {icon}
        </div>
        {!isNet && share > 0 && (
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground">{share}%</p>
            <p className="text-[10px] text-muted-foreground/70">of period</p>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={cn(
          "text-2xl sm:text-3xl font-bold tabular-nums",
          isNet && (isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
        )}>
          {isNet && netAmount !== undefined && (netAmount > 0 ? "+" : netAmount < 0 ? "−" : "")}
          {amount}
        </p>
        {isNet && netLabel && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{netLabel}</p>
        )}
        {!isNet && (
          <p className="text-xs text-muted-foreground/70">{share}% of this period</p>
        )}
      </div>
    </div>
  );
}


const PeriodPill = forwardRef<HTMLButtonElement, { label: string; badgeCount?: number }>(
  ({ label, badgeCount = 0, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className="relative inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary"
        {...props}
      >
        <CalendarDays className="h-4 w-4" />
        <span className="max-w-[240px] truncate">{label}</span>
        <span className="sr-only">Open period filter</span>
        {badgeCount > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {badgeCount}
          </span>
        ) : null}
      </button>
    );
  }
);
PeriodPill.displayName = "PeriodPill";


