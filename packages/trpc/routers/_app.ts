import { router } from "../index";
import { usersAppRouter } from "./users";
import { onboardingRouter } from "./onboarding";

export const appRouter = router({
  users: usersAppRouter,
  onboarding: onboardingRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
