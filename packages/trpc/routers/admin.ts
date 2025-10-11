import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@pesapeak/db/schema";
import {
  resetPasswordSchema,
  updateUserSchema,
  zAdminCreateUserSchema,
} from "@pesapeak/shared/types/admin";
import { generatePasswordSalt, hashPassword } from "../auth";
import { adminProcedure, router } from "../index";
import { User } from "../models/users";

export const adminAppRouter = router({
  stats: adminProcedure
    .output(
      z.object({
        numUsers: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const [[{ value: numUsers }]] =
        await Promise.all([
          ctx.db.select({ value: count() }).from(users),
        ]);

      return {
        numUsers,
      };
    }),
  
  createUser: adminProcedure
    .input(zAdminCreateUserSchema)
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.enum(["user", "admin"]).nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await User.create(ctx, input, input.role);
    }),
  updateUser: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.id == input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot update own user",
        });
      }

      const updateData: Partial<typeof users.$inferInsert> = {};

      if (input.role !== undefined) {
        updateData.role = input.role;
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      const result = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, input.userId));

      if (!result.changes) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
  resetPassword: adminProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.id == input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reset own password",
        });
      }
      const newSalt = generatePasswordSalt();
      const hashedPassword = await hashPassword(input.newPassword, newSalt);
      const result = await ctx.db
        .update(users)
        .set({ password: hashedPassword, salt: newSalt })
        .where(eq(users.id, input.userId));

      if (result.changes == 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
  getAdminNoticies: adminProcedure
    .output(
      z.object({
        // Unused for now
      }),
    )
    .query(() => {
      return {
        // Unused for now
      };
    }),
});
