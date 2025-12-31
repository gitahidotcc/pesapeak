"use client";

import { useState, useMemo, forwardRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Search,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/trpc";
import { type PeriodFilter } from "./period-filter-dialog";
import { TransactionsFilterDialog } from "./transactions-filter-dialog";
import { TransactionsList } from "./transactions-list";
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

  const { data: accounts } = api.accounts.list.useQuery();

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
    (filter.type === "all" ? 0 : 1) + (selectedAccountId ? 1 : 0);

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
        actionTrigger={null}
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

      <TransactionsList 
        filter={filter} 
        selectedAccountId={selectedAccountId}
        selectedCategoryId={selectedCategoryId}
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
  actionTrigger: ReactNode | null;
}

function TransactionsHeader({ periodLabel, periodTrigger, actionTrigger }: TransactionsHeaderProps) {
  return (
    <header className="space-y-4">
      {periodTrigger ?? (
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1 text-sm font-medium text-primary">
          <CalendarDays className="h-4 w-4" />
          <span>{periodLabel}</span>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor all your financial activity in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HeaderIconButton
            icon={<Search className="h-5 w-5" />}
            label="Search transactions"
            aria-disabled
          />
          {actionTrigger}
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
        props.disabled || props["aria-disabled"] ? "opacity-70" : "",
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
  const headlineColor = netPositive ? "from-emerald-500 to-emerald-600" : "from-rose-500 to-rose-600";

  return (
    <section className="space-y-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg",
          headlineColor
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/80">Net for {periodLabel}</p>
            <p className="mt-3 text-4xl font-semibold">
              {netAmount > 0 ? "+" : netAmount < 0 ? "−" : ""}
              {formatCurrency(Math.abs(netAmount), currency)}
            </p>
            <p className="mt-2 text-sm text-white/75">{netLabel}</p>
          </div>
          <div className="flex w-full max-w-[220px] flex-col items-start gap-3 rounded-2xl bg-white/10 p-3 text-sm sm:w-auto">
            <div className="flex w-full items-center justify-between">
              <span className="text-white/80">Income</span>
              <span className="font-semibold">{incomeShare}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: `${incomeShare}%` }}
              />
            </div>
            <div className="flex w-full items-center justify-between text-white/80">
              <span>Expenses</span>
              <span className="font-semibold">{expenseShare}%</span>
            </div>
          </div>
        </div>
        <Sparkline positive={netPositive} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        <AnalysisTile />
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
}

function SummaryTile({ label, amount, share, icon, accent }: SummaryTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
      <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{amount}</p>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{share}% of this period</p>
    </div>
  );
}

function AnalysisTile() {
  return (
    <Button
      type="button"
      variant="outline"
      className="flex h-full flex-col items-start justify-between gap-3 rounded-2xl border-dashed bg-muted/40 p-4 text-left hover:border-primary/50 hover:bg-muted/60"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Analysis</p>
        <p className="text-sm text-muted-foreground">
          Deep dive into spending patterns (coming soon)
        </p>
      </div>
    </Button>
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

function Sparkline({ positive }: { positive: boolean }) {
  const path = positive
    ? "M5 45 L35 20 L60 30 L85 10 L110 25 L140 5 L155 20"
    : "M5 15 L35 30 L60 10 L85 35 L110 15 L140 40 L155 25";

  return (
    <svg viewBox="0 0 160 50" className="mt-6 h-16 w-full text-white/70" role="presentation">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
      />
    </svg>
  );
}

