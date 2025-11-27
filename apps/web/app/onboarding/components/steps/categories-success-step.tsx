"use client";

import { CheckCircle2 } from "lucide-react";
import { StepComponentProps } from "@/app/onboarding/types/step-component";

export function CategoriesSuccessStep({ context }: StepComponentProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Categories created successfully!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your starter categories are all set up. You're ready to start tracking your finances.
          </p>
        </div>
      </div>
    </section>
  );
}

