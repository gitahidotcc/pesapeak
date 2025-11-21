"use client";

import { StepComponentProps } from "@/app/onboarding/components/steps/types";

export function WelcomeStep(_props: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-primary">Welcome to PesaPeak</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
          Let’s get your finances organized
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          PesaPeak guides you through setting up accounts, importing history, and training AI for smart
          categorization before you land on the dashboard.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "Connect your bank accounts",
          "Import CSV history for each account",
          "Map every column so data stays clean",
          "Let AI categorize smarter with a quick review",
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-card/20 p-4 text-sm text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide">Need help?</p>
        <p className="mt-1 text-lg font-bold">We’ll show you the essentials every step of the way.</p>
      </div>
    </section>
  );
}

