import { router } from "../index";
import { usersAppRouter } from "./users";

export const appRouter = router({
  users: usersAppRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
