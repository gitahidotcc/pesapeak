import { router } from "../index";
import { usersAppRouter } from "./users";
import { onboardingRouter } from "./onboarding";
import { accountsRouter } from "./accounts";
import { categoriesRouter } from "./categories";
import { transactionsRouter } from "./transactions";

export const appRouter = router({
  users: usersAppRouter,
  onboarding: onboardingRouter,
  accounts: accountsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
