"use client";

import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function AiCategorizationSetupStep({ context }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 5 · AI categorization setup</p>
        <h2 className="text-2xl font-bold text-card-foreground">Seed categories with AI confidence</h2>
        <p className="text-sm text-muted-foreground">
          We prefilled these categories based on your history. Confirm the ones that feel right and adjust weights.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {context.categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-card-foreground">{category.name}</p>
              <span className="text-xs font-semibold uppercase text-muted-foreground/80">{category.confidence}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full border border-border/60 px-3 py-1">Auto</span>
              <span className="rounded-full border border-border/60 px-3 py-1">Focus</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        AI tags help the review step move faster. You can always fine-tune categorization rules later.
      </div>
    </section>
  );
}

