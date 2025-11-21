"use client";

import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function ImportCsvStep({ context }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 2 · Import CSV</p>
        <h2 className="text-2xl font-bold text-card-foreground">Upload transaction history</h2>
        <p className="text-sm text-muted-foreground">
          Drag & drop CSV files or browse. Each file is tied to one of the accounts above.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center">
        <p className="text-lg font-semibold text-card-foreground">Drop CSV files here</p>
        <p className="text-sm text-muted-foreground">Support: UTF-8 CSV with headers, 10MB max.</p>
        <input
          type="file"
          accept=".csv"
          className="mx-auto mt-4 block text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground file:font-semibold"
        />
      </div>
      <div className="grid gap-4 rounded-2xl border border-border bg-card/30 p-5">
        <p className="text-sm font-semibold text-muted-foreground">Import will be associated with:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {context.heroAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{account.name}</p>
                <p className="text-xs text-muted-foreground">Balance: {account.balance}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground/80">Select</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        You can upload up to 5 files at once. Need to import more later? We’ll show you how in the next step.
      </div>
    </section>
  );
}

