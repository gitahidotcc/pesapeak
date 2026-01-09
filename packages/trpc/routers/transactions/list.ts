import { and, desc } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure } from "../../index";
import { listInputSchema, transactionOutputSchema } from "./schemas";
import { buildTransactionConditions } from "./utils";

export const list = authedProcedure
  .input(listInputSchema)
  .output(
    z.object({
      items: z.array(transactionOutputSchema),
      nextCursor: z.number().nullable(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { limit, cursor, ...filters } = input;
    const offset = cursor ?? 0;
    const conditions = buildTransactionConditions(ctx, filters);

    const queryOptions: any = {
      where: and(...conditions),
      orderBy: (transaction: any) => desc(transaction.date),
      limit: limit + 1,
      offset,
      with: {
        category: true,
      },
    };

    const results = await ctx.db.query.transactions.findMany(queryOptions);

    const hasMore = results.length > limit;
    const transactionList = hasMore ? results.slice(0, limit) : results;

    return {
      items: transactionList.map((transaction: any) => ({
        id: transaction.id,
        type: transaction.type as "income" | "expense" | "transfer",
        amount: transaction.amount ?? 0,
        accountId: transaction.accountId ?? null,
        categoryId: transaction.categoryId ?? null,
        categoryIcon: transaction.category?.icon ?? null,
        categoryColor: transaction.category?.color ?? null,
        fromAccountId: transaction.fromAccountId ?? null,
        toAccountId: transaction.toAccountId ?? null,
        parentTransactionId: transaction.parentTransactionId ?? null,
        isFee: Boolean(transaction.isFee),
        date: new Date(transaction.date ?? Date.now()).toISOString(),
        time: transaction.time ?? null,
        notes: transaction.notes ?? "",
        attachmentPath: transaction.attachmentPath ?? null,
        attachmentFileName: transaction.attachmentFileName ?? null,
        attachmentMimeType: transaction.attachmentMimeType ?? null,
        createdAt: new Date(transaction.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(transaction.updatedAt ?? Date.now()).toISOString(),
      })),
      nextCursor: hasMore ? offset + limit : null,
    };
  });
