"use client";

import type { ComponentType } from "react";

import {
  AiCategorizationReviewStep,
  AiCategorizationSetupStep,
  AccountsStep,
  ImportCsvStep,
  ImportSuccessStep,
  MapColumnsStep,
  StartingBalancesStep,
  WelcomeStep,
} from "@/app/onboarding/components/steps";
import type { StepComponentProps } from "@/app/onboarding/components/steps/types";
import { Stepper } from "@/app/onboarding/components/stepper";
import { useOnboardingFlow } from "@/app/onboarding/hooks/use-onboarding-flow";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "./actions";

const STEP_COMPONENTS: Record<string, ComponentType<StepComponentProps>> = {
  welcome: WelcomeStep,
  accounts: AccountsStep,
  "import-csv": ImportCsvStep,
  "map-columns": MapColumnsStep,
  "import-success": ImportSuccessStep,
  "ai-setup": AiCategorizationSetupStep,
  "ai-review": AiCategorizationReviewStep,
  balances: StartingBalancesStep,
};

export default function OnboardingPage() {
  const {
    steps,
    currentStep,
    nextStepTitle,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    startImportFlow,
    context,
  } = useOnboardingFlow();

  const activeStep = steps[currentStep] ?? steps[0];
  const StepComponent = STEP_COMPONENTS[activeStep.id as keyof typeof STEP_COMPONENTS];

  const handleNext = async () => {
    if (isLastStep) {
      await completeOnboarding();
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Stepper steps={steps} currentStep={currentStep} />
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
            {StepComponent ? (
              <StepComponent context={context} onImportAgain={startImportFlow} />
            ) : (
              <p className="text-sm text-slate-500">Pulling your onboarding flow together…</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white/80 px-6 py-4 shadow-sm">
            <Button
              onClick={goToPreviousStep}
              disabled={isFirstStep}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
            >
              {isLastStep ? "Finish onboarding" : `Next · ${nextStepTitle}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

