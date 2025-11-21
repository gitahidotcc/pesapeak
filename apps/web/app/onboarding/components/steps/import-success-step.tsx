"use client";

import { StepComponentProps } from "@/app/onboarding/components/steps/types";

export function ImportSuccessStep({ context, onImportAgain }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 4 · Import success</p>
        <h2 className="text-2xl font-bold text-card-foreground">Your files landed safely</h2>
        <p className="text-sm text-muted-foreground">
          We matched each transaction to the right account and column mapping. Repeat whenever you have new data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {context.importHistory.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Account</p>
              <span className="text-xs font-semibold uppercase text-muted-foreground/80">{item.importedAt}</span>
            </div>
            <p className="text-lg font-bold text-card-foreground">{item.account}</p>
            <p className="text-sm text-muted-foreground">{item.fileName}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">{item.status}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/40 p-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>Want to import another CSV or link a new account? Go ahead—no need to leave onboarding.</p>
        <div className="flex gap-3">
          <button
            onClick={onImportAgain}
            type="button"
            className="rounded-full border border-border/80 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground transition hover:bg-card/60"
          >
            Import another
          </button>
          <button
            type="button"
            className="rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold uppercase text-primary-foreground shadow-sm transition hover:bg-primary/80"
          >
            Create account
          </button>
        </div>
      </div>
    </section>
  );
}

