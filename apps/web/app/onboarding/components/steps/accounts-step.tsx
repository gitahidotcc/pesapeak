"use client";

import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function AccountsStep({ context }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 1 · Create accounts</p>
        <h2 className="text-2xl font-bold text-card-foreground">Where is your money stored?</h2>
        <p className="text-sm text-muted-foreground">
          Add up to three accounts for now, and we’ll sync every import with the correct source.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {context.heroAccounts.map((account) => (
          <div key={account.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-card-foreground">{account.name}</p>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{account.type}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-card-foreground">{account.balance}</p>
            <p className="mt-1 text-sm text-muted-foreground">{account.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">Need another account?</p>
        <button className="mt-3 inline-flex items-center justify-center rounded-full border border-border/80 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10">
          Add an account
        </button>
      </div>
    </section>
  );
}

