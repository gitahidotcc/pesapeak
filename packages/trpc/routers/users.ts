import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { count } from "drizzle-orm";
import { users } from "@pesapeak/db/schema";
import serverConfig from "@pesapeak/shared/config";
import {
  zUpdateUserSettingsSchema,
  zUserSettingsSchema,
  zWhoAmIResponseSchema,
} from "@pesapeak/shared/types/users";
import {
  authedProcedure,
  createRateLimitMiddleware,
  publicProcedure,
  router,
} from "../index";
import { User } from "../models/users";

export const usersAppRouter = router({
  checkAccountExists: publicProcedure
    .output(
      z.object({
        exists: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      const [{ count: userCount }] = await ctx.db
        .select({ count: count() })
        .from(users);
      return { exists: userCount > 0 };
    }),
  deleteAccount: authedProcedure
    .input(
      z.object({
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await User.fromCtx(ctx);
      await user.deleteAccount(input.password);
    }),
  whoami: authedProcedure
    .output(zWhoAmIResponseSchema)
    .query(async ({ ctx }) => {
      const user = await User.fromCtx(ctx);
      return user.asWhoAmI();
    }),
  settings: authedProcedure
    .output(zUserSettingsSchema)
    .query(async ({ ctx }) => {
      const user = await User.fromCtx(ctx);
      return await user.getSettings();
    }),
  updateSettings: authedProcedure
    .input(zUpdateUserSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await User.fromCtx(ctx);
      await user.updateSettings(input);
    }),
  verifyEmail: publicProcedure
    .use(
      createRateLimitMiddleware({
        name: "users.verifyEmail",
        windowMs: 5 * 60 * 1000,
        maxRequests: 10,
      }),
    )
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await User.verifyEmail(ctx, input.email, input.token);
      return { success: true };
    }),
  resendVerificationEmail: publicProcedure
    .use(
      createRateLimitMiddleware({
        name: "users.resendVerificationEmail",
        windowMs: 5 * 60 * 1000,
        maxRequests: 3,
      }),
    )
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await User.resendVerificationEmail(ctx, input.email);
      return { success: true };
    }),
});
