"use client";

import type { OnboardingStepDefinition } from "@/app/onboarding/types/onboarding-flow";

type StepperProps = {
  steps: OnboardingStepDefinition[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {currentStepData?.title}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}% completed
          </p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
