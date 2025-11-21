"use client";

import { ACCOUNT_TYPE_LABELS } from "@/app/onboarding/types/onboarding-flow";
import { StepComponentProps } from "@/app/onboarding/types/step-component";

const CURRENCY_FLAG_MAP: Record<string, string> = {
  KES: "🇰🇪",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

const formatBalance = (value: number | undefined, currency?: string) => {
  const amount = typeof value === "number" ? value : 0;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency ?? ""}`.trim();
  }
};

const formatTimestamp = (value: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function AccountsStep({ context }: StepComponentProps) {
  const { accounts, accountsLoading } = context;
  const hasAccounts = accounts.length > 0;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 1 · Create accounts</p>
        <h2 className="text-2xl font-bold text-card-foreground">Where is your money stored?</h2>
        <p className="text-sm text-muted-foreground">
          Add each account you use today so we can keep everything organized from day one.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card p-4 shadow-sm">
        <table className="min-w-full border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Type
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Currency
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Color
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Icon
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Initial Balance
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total Balance
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Default
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Created / Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {accountsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan={10} className="py-3 px-3">
                    <div className="h-3 w-full rounded-full bg-muted-foreground/30" />
                  </td>
                </tr>
              ))
            ) : hasAccounts ? (
              accounts.map((account) => (
                <tr key={account.id} className="bg-muted/20">
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-card-foreground">
                    {account.name}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className="flex items-center gap-2 text-card-foreground">
                      <span aria-hidden>{CURRENCY_FLAG_MAP[account.currency.toUpperCase()] ?? "🏳️"}</span>
                      <span className="font-medium">{account.currency.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: account.color }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {account.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">{account.icon}</td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {account.notes ? account.notes : "—"}
                  </td>
                  <td className="px-3 py-3 text-sm text-card-foreground">
                    {formatBalance(account.initialBalance, account.currency)}
                  </td>
                  <td className="px-3 py-3 text-sm text-card-foreground">
                    {formatBalance(account.totalBalance, account.currency)}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {account.defaultAccount ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    <div className="text-xs font-semibold text-card-foreground">
                      {formatTimestamp(account.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatTimestamp(account.updatedAt)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No accounts yet. Click “Add an account” to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>You can add more accounts later from the dashboard.</p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border/80 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Add an account
        </button>
      </div>
    </section>
  );
}