"use client";

import { StepComponentProps } from "@/app/onboarding/components/steps/types";

export function AiCategorizationReviewStep({ context }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-muted-foreground">Step 6 · AI categorization review</p>
        <h2 className="text-2xl font-bold text-card-foreground">Swipe through AI-suggested categories</h2>
        <p className="text-sm text-muted-foreground">
          Give the AI a thumbs up or tweak a suggestion before we lock them in for your dashboard.
        </p>
      </div>
      <div className="space-y-4">
        {context.reviewItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-muted-foreground/80">
              <p>{item.date}</p>
              <p>{item.guessedCategory}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-card-foreground">{item.merchant}</p>
                <p className="text-sm text-muted-foreground">{item.amount}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="rounded-full border border-border/60 px-4 py-1 text-xs font-semibold uppercase text-primary">
                  Approve
                </button>
                <button className="rounded-full border border-border/60 px-4 py-1 text-xs font-semibold uppercase text-muted-foreground">
                  Modify
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4 text-sm text-muted-foreground">
        Swiping through a few transactions gives the AI the context it needs for future imports.
      </div>
    </section>
  );
}

