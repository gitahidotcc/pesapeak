import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { transactions } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";

export const periods = authedProcedure
  .output(
    z.object({
      monthSummaries: z.array(
        z.object({
          year: z.number(),
          month: z.number(),
          transactionCount: z.number(),
          income: z.number(),
          expenses: z.number(),
          netAmount: z.number(),
        })
      ),
      availableMonths: z.array(z.object({ year: z.number(), month: z.number() })),
      availableYears: z.array(z.number()),
    })
  )
  .query(async ({ ctx }) => {
    // Let SQLite do the heavy lifting: group by year/month and aggregate
    // counts and totals in a single query. We always scope by user.
    const aggregated = await ctx.db
      .select({
        year: sql<number>`CAST(STRFTIME('%Y', datetime(${transactions.date}, 'unixepoch')) AS INTEGER)`,
        // JS Date months are 0-based, so subtract 1 from the 1-based month.
        month: sql<number>`CAST(STRFTIME('%m', datetime(${transactions.date}, 'unixepoch')) AS INTEGER) - 1`,
        transactionCount: sql<number>`COUNT(*)`,
        income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id))
      .groupBy(
        sql`STRFTIME('%Y', datetime(${transactions.date}, 'unixepoch'))`,
        sql`STRFTIME('%m', datetime(${transactions.date}, 'unixepoch'))`,
      )
      .orderBy(
        desc(sql`STRFTIME('%Y', datetime(${transactions.date}, 'unixepoch'))`),
        desc(sql`STRFTIME('%m', datetime(${transactions.date}, 'unixepoch'))`),
      );

    const monthSummaries = aggregated.map((row) => ({
      year: Number(row.year),
      month: Number(row.month),
      transactionCount: Number(row.transactionCount),
      income: Number(row.income),
      expenses: Number(row.expenses),
      netAmount: Number(row.income) - Number(row.expenses),
    }));

    const availableMonths = monthSummaries.map(({ year, month }) => ({ year, month }));
    const availableYears = Array.from(new Set(monthSummaries.map((m) => m.year))).sort(
      (a, b) => b - a,
    );

    return {
      monthSummaries,
      availableMonths,
      availableYears,
    };
  });
