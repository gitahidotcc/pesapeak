import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authedProcedure } from "../../index";
import { listInputSchema, transactionOutputSchema } from "./schemas";
import { buildTransactionConditions } from "./utils";
import { transactions, categories, financialAccounts } from "@pesapeak/db/schema";

export const list = authedProcedure
  .input(listInputSchema)
  .output(
    z.object({
      items: z.array(transactionOutputSchema),
      nextCursor: z.number().nullable(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { limit, cursor, search, ...filters } = input;
    const offset = cursor ?? 0;
    
    // If search is present, use query builder API with EXISTS subqueries
    // Otherwise, use the relational query API for simplicity
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const baseConditions = buildTransactionConditions(ctx, filters);
      
      // Build search condition using EXISTS subqueries for related tables
      // This is more efficient than multiple LEFT JOINs and works reliably
      const searchCondition = or(
        // Search in transaction notes
        like(transactions.notes, searchTerm),
        // Search in category name
        sql`EXISTS (
          SELECT 1 FROM ${categories} 
          WHERE ${categories.id} = ${transactions.categoryId} 
          AND ${categories.name} LIKE ${searchTerm}
        )`,
        // Search in account name (for income/expense transactions)
        sql`EXISTS (
          SELECT 1 FROM ${financialAccounts} 
          WHERE ${financialAccounts.id} = ${transactions.accountId} 
          AND ${financialAccounts.name} LIKE ${searchTerm}
        )`,
        // Search in from account name (for transfers)
        sql`EXISTS (
          SELECT 1 FROM ${financialAccounts} 
          WHERE ${financialAccounts.id} = ${transactions.fromAccountId} 
          AND ${financialAccounts.name} LIKE ${searchTerm}
        )`,
        // Search in to account name (for transfers)
        sql`EXISTS (
          SELECT 1 FROM ${financialAccounts} 
          WHERE ${financialAccounts.id} = ${transactions.toAccountId} 
          AND ${financialAccounts.name} LIKE ${searchTerm}
        )`
      )!;
      
      const allConditions = [...baseConditions, searchCondition];
      
      // Use query builder API - need to join with category to get icon/color
      const query = ctx.db
        .select({
          id: transactions.id,
          type: transactions.type,
          amount: transactions.amount,
          accountId: transactions.accountId,
          categoryId: transactions.categoryId,
          categoryIcon: categories.icon,
          categoryColor: categories.color,
          fromAccountId: transactions.fromAccountId,
          toAccountId: transactions.toAccountId,
          parentTransactionId: transactions.parentTransactionId,
          isFee: transactions.isFee,
          date: transactions.date,
          time: transactions.time,
          notes: transactions.notes,
          attachmentPath: transactions.attachmentPath,
          attachmentFileName: transactions.attachmentFileName,
          attachmentMimeType: transactions.attachmentMimeType,
          createdAt: transactions.createdAt,
          updatedAt: transactions.updatedAt,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(...allConditions))
        .orderBy(desc(transactions.date))
        .limit(limit + 1)
        .offset(offset);
      
      const results = await query;
      
      const hasMore = results.length > limit;
      const transactionList = hasMore ? results.slice(0, limit) : results;
      
      return {
        items: transactionList.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type as "income" | "expense" | "transfer",
          amount: transaction.amount ?? 0,
          accountId: transaction.accountId ?? null,
          categoryId: transaction.categoryId ?? null,
          categoryIcon: transaction.categoryIcon ?? null,
          categoryColor: transaction.categoryColor ?? null,
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
    }
    
    // No search - use relational query API (simpler and works well for non-search queries)
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
