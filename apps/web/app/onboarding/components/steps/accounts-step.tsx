"use client";

import { ACCOUNT_TYPE_LABELS } from "@/app/onboarding/types/onboarding-flow";
import { StepComponentProps } from "@/app/onboarding/types/step-component";
import { CURRENCY_FLAG_MAP, formatBalance } from "@/app/onboarding/lib/format";
import { CreateAccountForm } from "@/app/dashboard/settings/accounts/components/create-account-form";

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
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 2 · Create accounts</p>
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
                Balance
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Default
              </th>
            </tr>
          </thead>
          <tbody>
            {accountsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan={5} className="py-3 px-3">
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
                  <td className="px-3 py-3 text-sm font-semibold text-card-foreground">
                    {formatBalance(account.totalBalance, account.currency)}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {account.defaultAccount ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        Default
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No accounts yet. Click "Add an account" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>You can add more accounts later from the dashboard.</p>
        <div>
          <CreateAccountForm />
        </div>
      </div>
    </section>
  );
}