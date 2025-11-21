"use client";

import type { OnboardingContext } from "@/app/onboarding/hooks/use-onboarding-flow";

export type StepComponentProps = {
  context: OnboardingContext;
  onImportAgain?: () => void;
};

