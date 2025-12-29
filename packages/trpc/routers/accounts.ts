import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { financialAccounts } from "@pesapeak/db/schema";
import { zAccountTypeSchema } from "@pesapeak/shared/types/accounts";
import { authedProcedure, router } from "../index";

const accountOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  accountType: zAccountTypeSchema,
  currency: z.string(),
  color: z.string(),
  icon: z.string(),
  notes: z.string(),
  initialBalance: z.number(),
  totalBalance: z.number(),
  defaultAccount: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createAccountInputSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  accountType: zAccountTypeSchema,
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  icon: z.string().min(1, "Icon is required"),
  notes: z.string().optional(),
  initialBalance: z.number().default(0),
  defaultAccount: z.boolean().default(false),
});

const updateAccountInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Account name is required").max(100).optional(),
  accountType: zAccountTypeSchema.optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  icon: z.string().min(1, "Icon is required").optional(),
  notes: z.string().optional(),
  defaultAccount: z.boolean().optional(),
});

export const accountsRouter = router({
  list: authedProcedure.output(z.array(accountOutputSchema)).query(async ({ ctx }) => {
    const accounts = await ctx.db.query.financialAccounts.findMany({
      where: eq(financialAccounts.userId, ctx.user.id),
      orderBy: (account) => desc(account.createdAt),
    });

    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      accountType: account.accountType as z.infer<typeof zAccountTypeSchema>,
      currency: account.currency,
      color: account.color,
      icon: account.icon,
      notes: account.notes ?? "",
      initialBalance: account.initialBalance ?? 0,
      totalBalance: account.totalBalance ?? 0,
      defaultAccount: Boolean(account.defaultAccount),
      createdAt: new Date(account.createdAt ?? Date.now()).toISOString(),
      updatedAt: new Date(account.updatedAt ?? Date.now()).toISOString(),
    }));
  }),

  create: authedProcedure
    .input(createAccountInputSchema)
    .output(accountOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset any existing default account
      if (input.defaultAccount) {
        await ctx.db
          .update(financialAccounts)
          .set({ defaultAccount: false })
          .where(
            and(
              eq(financialAccounts.userId, ctx.user.id),
              eq(financialAccounts.defaultAccount, true)
            )
          );
      }

      const [newAccount] = await ctx.db
        .insert(financialAccounts)
        .values({
          userId: ctx.user.id,
          name: input.name,
          accountType: input.accountType,
          currency: input.currency,
          color: input.color,
          icon: input.icon,
          notes: input.notes ?? "",
          initialBalance: input.initialBalance,
          totalBalance: input.initialBalance,
          defaultAccount: input.defaultAccount,
        })
        .returning();

      if (!newAccount) {
        throw new Error("Failed to create account");
      }

      return {
        id: newAccount.id,
        name: newAccount.name,
        accountType: newAccount.accountType as z.infer<typeof zAccountTypeSchema>,
        currency: newAccount.currency,
        color: newAccount.color,
        icon: newAccount.icon,
        notes: newAccount.notes ?? "",
        initialBalance: newAccount.initialBalance ?? 0,
        totalBalance: newAccount.totalBalance ?? 0,
        defaultAccount: Boolean(newAccount.defaultAccount),
        createdAt: new Date(newAccount.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(newAccount.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  update: authedProcedure
    .input(updateAccountInputSchema)
    .output(accountOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingAccount = await ctx.db.query.financialAccounts.findFirst({
        where: and(
          eq(financialAccounts.id, input.id),
          eq(financialAccounts.userId, ctx.user.id)
        ),
      });

      if (!existingAccount) {
        throw new Error("Account not found or you don't have permission to update it");
      }

      // If setting as default, unset any existing default account
      if (input.defaultAccount) {
        await ctx.db
          .update(financialAccounts)
          .set({ defaultAccount: false })
          .where(
            and(
              eq(financialAccounts.userId, ctx.user.id),
              eq(financialAccounts.defaultAccount, true)
            )
          );
      }

      const [updatedAccount] = await ctx.db
        .update(financialAccounts)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.accountType !== undefined && { accountType: input.accountType }),
          ...(input.currency !== undefined && { currency: input.currency }),
          ...(input.color !== undefined && { color: input.color }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.defaultAccount !== undefined && { defaultAccount: input.defaultAccount }),
        })
        .where(eq(financialAccounts.id, input.id))
        .returning();

      if (!updatedAccount) {
        throw new Error("Failed to update account");
      }

      return {
        id: updatedAccount.id,
        name: updatedAccount.name,
        accountType: updatedAccount.accountType as z.infer<typeof zAccountTypeSchema>,
        currency: updatedAccount.currency,
        color: updatedAccount.color,
        icon: updatedAccount.icon,
        notes: updatedAccount.notes ?? "",
        initialBalance: updatedAccount.initialBalance ?? 0,
        totalBalance: updatedAccount.totalBalance ?? 0,
        defaultAccount: Boolean(updatedAccount.defaultAccount),
        createdAt: new Date(updatedAccount.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(updatedAccount.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingAccount = await ctx.db.query.financialAccounts.findFirst({
        where: and(
          eq(financialAccounts.id, input.id),
          eq(financialAccounts.userId, ctx.user.id)
        ),
      });

      if (!existingAccount) {
        throw new Error("Account not found or you don't have permission to delete it");
      }

      await ctx.db
        .delete(financialAccounts)
        .where(eq(financialAccounts.id, input.id));

      return { success: true };
    }),

  getTransactionCount: authedProcedure
    .input(z.object({ accountId: z.string() }))
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const existingAccount = await ctx.db.query.financialAccounts.findFirst({
        where: and(
          eq(financialAccounts.id, input.accountId),
          eq(financialAccounts.userId, ctx.user.id)
        ),
      });

      if (!existingAccount) {
        throw new Error("Account not found or you don't have permission to access it");
      }

      // TODO: When transactions table is added, count transactions for this account
      // For now, return 0
      return { count: 0 };
    }),
});

