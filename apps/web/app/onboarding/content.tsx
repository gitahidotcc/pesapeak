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
import type { StepComponentProps } from "@/app/onboarding/types/step-component";
import { Stepper } from "@/app/onboarding/components/stepper";
import { useOnboardingFlow } from "@/app/onboarding/hooks/use-onboarding-flow";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { api } from "@/lib/trpc";

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

export function OnboardingContent({ initialStep }: { initialStep: number }) {
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
    } = useOnboardingFlow(initialStep);

    const activeStep = steps[currentStep] ?? steps[0];
    const StepComponent = STEP_COMPONENTS[activeStep.id as keyof typeof STEP_COMPONENTS];

    const completeMutation = api.onboarding.complete.useMutation({
        onSuccess: () => {
            window.location.href = "/dashboard";
        },
    });

    const handleNext = async () => {
        if (isLastStep) {
            completeMutation.mutate();
        } else {
            goToNextStep();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/90">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <ThemeSwitch />
                    </div>
                    <Stepper steps={steps} currentStep={currentStep} />
                    <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
                        {StepComponent ? (
                            <StepComponent context={context} onImportAgain={startImportFlow} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Pulling your onboarding flow together…</p>
                        )}
                    </div>
                    <div className="flex items-center justify-between rounded-3xl border border-border bg-card/80 px-6 py-4 shadow-sm">
                        <Button
                            onClick={goToPreviousStep}
                            disabled={isFirstStep}
                            className="px-5 py-2 text-sm font-semibold"
                            variant="outline"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="px-6 py-2 text-sm font-semibold"
                            variant="default"
                        >
                            {isLastStep ? "Finish onboarding" : `Next · ${nextStepTitle}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
