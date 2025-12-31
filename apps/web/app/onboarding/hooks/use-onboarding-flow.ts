"use client";

import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/trpc";
import type {
  OnboardingContext,
  OnboardingStepDefinition,
} from "@/app/onboarding/types/onboarding-flow";

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: "welcome",
    title: "Onboarding Welcome",
    description: "Learn how PesaPeak keeps your finances healthy.",
  },
  {
    id: "accounts",
    title: "Create Accounts",
    description: "Tell us where your money lives today.",
  },
  {
    id: "categories",
    title: "Setup Categories",
    description: "Choose your starter categories for organizing transactions.",
  },
  {
    id: "success",
    title: "All Set!",
    description: "You're ready to start using PesaPeak.",
  },
];

export function useOnboardingFlow(initialStep: number = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const accountsQuery = api.accounts.list.useQuery();

  const updateStepMutation = api.onboarding.updateStep.useMutation();

  const goToStep = useCallback(
    (stepIndex: number) => {
      const limitedIndex = Math.max(0, Math.min(stepIndex, ONBOARDING_STEPS.length - 1));
      setCurrentStep(limitedIndex);
      updateStepMutation.mutate({ step: limitedIndex });
    },
    [setCurrentStep, updateStepMutation],
  );

  const goToNextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const context = useMemo<OnboardingContext>(() => {
    return {
      accounts: accountsQuery.data ?? [],
      accountsLoading: accountsQuery.isLoading,
      goToNextStep,
    };
  }, [accountsQuery.data, accountsQuery.isLoading, goToNextStep]);

  const goToPreviousStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const nextStepTitle = ONBOARDING_STEPS[currentStep + 1]?.title;

  return {
    steps: ONBOARDING_STEPS,
    currentStep,
    nextStepTitle,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    context,
  };
}

