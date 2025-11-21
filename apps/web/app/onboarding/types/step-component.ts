"use client";

import type { OnboardingContext } from "@/app/onboarding/types/onboarding-flow";

export type StepComponentProps = {
  context: OnboardingContext;
  onImportAgain?: () => void;
};

