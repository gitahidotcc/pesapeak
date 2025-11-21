import { desc, eq } from "drizzle-orm";
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
});

