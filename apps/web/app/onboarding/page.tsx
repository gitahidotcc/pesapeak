

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OnboardingContent } from "./content";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const initialStep = session?.user.onboardingStep || 0;

  return <OnboardingContent initialStep={initialStep} />;
}

