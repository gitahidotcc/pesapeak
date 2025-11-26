"use client";

import { ACCOUNT_TYPE_LABELS } from "@/app/onboarding/types/onboarding-flow";
import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function StartingBalancesStep({ context }: StepComponentProps) {
  const { accounts, accountsLoading } = context;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 4 · Starting balances</p>
        <h2 className="text-2xl font-bold text-card-foreground">Seed the balances you want to begin with</h2>
        <p className="text-sm text-muted-foreground">
          Set each account’s starting balance before the AI begins calculating projections.
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        {accountsLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-border/70 bg-card/20 p-4"
            >
              <div className="h-4 w-32 rounded bg-muted-foreground/30" />
              <div className="mt-3 h-12 w-full rounded-2xl bg-muted-foreground/30" />
            </div>
          ))
        ) : accounts.length > 0 ? (
          accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/20 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-card-foreground">{account.name}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Currency: {account.currency.toUpperCase()}
                </span>
              </div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Starting balance
              </label>
              <input
                className="rounded-2xl border border-border bg-card/50 px-4 py-3 text-lg font-semibold text-card-foreground focus:border-primary focus:outline-none"
                defaultValue={account.initialBalance}
                aria-label={`Starting balance for ${account.name}`}
              />
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-6 text-sm text-muted-foreground">
            No accounts yet. Add an account on the previous step to seed starting balances.
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        You can edit these balances later. The dashboard will respect the amounts you set right now.
      </div>
    </section>
  );
}