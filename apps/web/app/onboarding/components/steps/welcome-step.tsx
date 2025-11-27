"use client";

import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function WelcomeStep(_props: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-primary">Welcome to PesaPeak</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
          Let&apos;s get your finances organized
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          PesaPeak guides you through setting up your accounts and organizing your categories before you land on the dashboard.
        </p>
      </div>
    </section>
  );
}

