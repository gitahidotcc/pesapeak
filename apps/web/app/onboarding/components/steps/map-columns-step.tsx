"use client";

import { StepComponentProps } from "@/app/onboarding/types/step-component";

const mappingSamples = [
  { csv: "Date", field: "Transaction Date" },
  { csv: "Description", field: "Merchant" },
  { csv: "Amount", field: "Amount" },
  { csv: "Category", field: "Category Suggestion" },
];

export function MapColumnsStep(_props: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 3 · Map columns</p>
        <h2 className="text-2xl font-bold text-card-foreground">Match your headers to ours</h2>
        <p className="text-sm text-muted-foreground">
          Elastic matches can guess most fields, but confirm the ones that matter so categorization stays accurate.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CSV column</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">PesaPeak field</p>
        </div>
        <div className="mt-3 space-y-3">
          {mappingSamples.map((row) => (
            <div
              key={row.csv}
              className="flex items-center justify-between rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm"
            >
              <span className="text-card-foreground">{row.csv}</span>
              <div className="flex items-center gap-2 text-card-foreground">
                <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  {row.field}
                </span>
                <span className="text-xs text-muted-foreground">Edit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        We store your column mappings so future imports are instant. You can always adjust them from Settings.
      </div>
    </section>
  );
}

