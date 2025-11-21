"use client";

import type { OnboardingStepDefinition } from "@/app/onboarding/hooks/use-onboarding-flow";

type StepperProps = {
  steps: OnboardingStepDefinition[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 overflow-x-auto py-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex flex-1 min-w-[150px] flex-col gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                    ? "border-border bg-card text-muted-foreground"
                    : "border-border bg-transparent text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground/70">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

