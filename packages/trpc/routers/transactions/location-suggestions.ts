import { and, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure } from "../../index";
import { transactions } from "@pesapeak/db/schema";

export const locationSuggestions = authedProcedure
  .input(
    z.object({
      prefix: z.string(),
      accountId: z.string().optional(),
    })
  )
  .output(z.array(z.string()))
  .query(async ({ ctx, input }) => {
    const prefix = input.prefix.trim();
    const conditions = [
      eq(transactions.userId, ctx.user.id),
      sql`${transactions.locationName} IS NOT NULL AND TRIM(${transactions.locationName}) != ''`,
    ];

    if (prefix.length > 0) {
      conditions.push(like(transactions.locationName, `${prefix}%`));
    }
    if (input.accountId) {
      conditions.push(eq(transactions.accountId, input.accountId));
    }

    const rows = await ctx.db
      .selectDistinct({
        locationName: transactions.locationName,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(transactions.locationName)
      .limit(10);

    return rows
      .map((r) => r.locationName)
      .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
  });
