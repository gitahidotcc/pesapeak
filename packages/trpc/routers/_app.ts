import { router } from "../index";
import { usersAppRouter } from "./users";
import { onboardingRouter } from "./onboarding";
import { accountsRouter } from "./accounts";

export const appRouter = router({
  users: usersAppRouter,
  onboarding: onboardingRouter,
  accounts: accountsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
