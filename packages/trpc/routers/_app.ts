import { router } from "../index";
import { adminAppRouter } from "./admin";
import { usersAppRouter } from "./users";

export const appRouter = router({
  users: usersAppRouter,
  admin: adminAppRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
