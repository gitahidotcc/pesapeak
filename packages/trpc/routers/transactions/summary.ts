import { and, sql } from "drizzle-orm";
import { z } from "zod";
import { transactions } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";
import { transactionFiltersSchema } from "./schemas";
import { buildTransactionConditions } from "./utils";

export const summary = authedProcedure
  .input(transactionFiltersSchema.optional())
  .output(
    z.object({
      income: z.number(),
      expenses: z.number(),
    })
  )
  .query(async ({ ctx, input }) => {
    const conditions = buildTransactionConditions(ctx, input);
    const [result] = await ctx.db
      .select({
        income: sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expenses: sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(and(...conditions));

    return {
      income: Number(result?.income ?? 0),
      expenses: Number(result?.expenses ?? 0),
    };
  });
