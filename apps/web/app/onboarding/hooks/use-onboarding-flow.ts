"use client";

import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/trpc";
import type {
  OnboardingAccount,
  OnboardingCategory,
  OnboardingContext,
  OnboardingImport,
  OnboardingReviewItem,
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
    id: "import-csv",
    title: "Import CSV",
    description: "Upload your transaction history file.",
  },
  {
    id: "map-columns",
    title: "Map Columns",
    description: "Match your CSV columns to PesaPeak fields.",
  },
  {
    id: "import-success",
    title: "Import Success",
    description: "Review what we imported and what to do next.",
  },
  {
    id: "ai-setup",
    title: "AI Categorization Setup",
    description: "Configure AI to understand your spending.",
  },
  {
    id: "ai-review",
    title: "AI Categorization Review",
    description: "Swipe through AI suggestions before finalizing.",
  },
  {
    id: "balances",
    title: "Starting Balances",
    description: "Seed the account balances you want to begin with.",
  },
];

export function useOnboardingFlow(initialStep: number = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const context = useMemo<OnboardingContext>(() => {
    const heroAccounts: OnboardingAccount[] = [
      {
        id: "main-checking",
        name: "Main Checking",
        type: "Checking account",
        balance: "$4,200.00",
        detail: "Linked via Plaid · USD",
      },
      {
        id: "savings",
        name: "Rainy Day Savings",
        type: "Savings account",
        balance: "$16,360.45",
        detail: "Linked via manual entry",
      },
      {
        id: "apie",
        name: "API Payroll",
        type: "Payoneer account",
        balance: "$8,110.20",
        detail: "Auto-import from payroll CSV",
      },
    ];

    const importHistory: OnboardingImport[] = [
      {
        id: "import-01",
        account: "Main Checking",
        fileName: "checking-aug.csv",
        importedAt: "Today · 2:18 PM",
        status: "42 transactions imported",
      },
      {
        id: "import-02",
        account: "API Payroll",
        fileName: "payroll-oct.csv",
        importedAt: "Yesterday · 5:03 PM",
        status: "Payroll history synced",
      },
    ];

    const categories: OnboardingCategory[] = [
      {
        id: "groceries",
        name: "Groceries",
        description: "Essentials and food",
        confidence: "92% sure",
      },
      {
        id: "utilities",
        name: "Utilities",
        description: "Bills and subscriptions",
        confidence: "87% sure",
      },
      {
        id: "travel",
        name: "Travel & Leisure",
        description: "Flights, hotels, experiences",
        confidence: "78% sure",
      },
    ];

    const reviewItems: OnboardingReviewItem[] = [
      {
        id: "review-01",
        merchant: "Safaricom PLC",
        amount: "Ksh 3,450.00",
        guessedCategory: "Telecom",
        date: "Nov 18",
      },
      {
        id: "review-02",
        merchant: "Nairobi Matatu",
        amount: "Ksh 1,200.00",
        guessedCategory: "Transport",
        date: "Nov 19",
      },
      {
        id: "review-03",
        merchant: "Garden City Mall",
        amount: "Ksh 6,150.00",
        guessedCategory: "Shopping",
        date: "Nov 19",
      },
    ];

    return {
      heroAccounts,
      importHistory,
      categories,
      reviewItems,
    };
  }, []);

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

  const goToPreviousStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const startImportFlow = useCallback(() => {
    goToStep(2);
  }, [goToStep]);

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
    startImportFlow,
    context,
  };
}

