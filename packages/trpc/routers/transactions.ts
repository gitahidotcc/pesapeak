import { and, desc, eq, sql, gte, lte, or } from "drizzle-orm";
import { z } from "zod";
import { transactions, financialAccounts, categories } from "@pesapeak/db/schema";
import { authedProcedure, router } from "../index";
import type { AuthedContext } from "../index";
import fs from "node:fs/promises";
import path from "node:path";
import config from "@pesapeak/shared/config";
import { createId } from "@paralleldrive/cuid2";

const transactionOutputSchema = z.object({
  id: z.string(),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number(),
  accountId: z.string().nullable(),
  categoryId: z.string().nullable(),
  categoryIcon: z.string().nullable(),
  categoryColor: z.string().nullable(),
  fromAccountId: z.string().nullable(),
  toAccountId: z.string().nullable(),
  // Fee / linked-transaction metadata
  parentTransactionId: z.string().nullable(),
  isFee: z.boolean(),
  date: z.string(),
  time: z.string().nullable(),
  notes: z.string(),
  attachmentPath: z.string().nullable(),
  attachmentFileName: z.string().nullable(),
  attachmentMimeType: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const feeInputSchema = z
  .object({
    amount: z.number().min(0.01, "Fee amount must be greater than 0"),
    accountId: z.string().optional(),
    categoryId: z.string().optional(),
  })
  .optional();

const createTransactionInputSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  date: z.string(), // ISO date string
  time: z.string().optional(), // HH:mm format
  notes: z.string().optional(),
  fee: feeInputSchema,
  attachment: z
    .object({
      fileName: z.string(),
      mimeType: z.string(),
      data: z.string(), // base64 encoded
    })
    .optional(),
});

async function saveAttachment(
  userId: string,
  transactionId: string,
  attachment: { fileName: string; mimeType: string; data: string }
): Promise<{ path: string; fileName: string; mimeType: string }> {
  // Create transactions directory in data dir
  const transactionsDir = path.join(config.dataDir, "transactions", userId);
  await fs.mkdir(transactionsDir, { recursive: true });

  // Get file extension from mime type or filename
  const getExtension = (mimeType: string, fileName: string): string => {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
    };
    return mimeToExt[mimeType] || path.extname(fileName) || ".bin";
  };

  const extension = getExtension(attachment.mimeType, attachment.fileName);
  const fileName = `${transactionId}${extension}`;
  const filePath = path.join(transactionsDir, fileName);

  // Decode base64 and save
  const buffer = Buffer.from(attachment.data, "base64");
  await fs.writeFile(filePath, buffer);

  return {
    path: filePath,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
  };
}

const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const listInputSchema = transactionFiltersSchema.extend({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.number().min(0).optional(),
});

type TransactionFilters = z.infer<typeof transactionFiltersSchema>;

const buildTransactionConditions = (ctx: AuthedContext, filters?: TransactionFilters) => {
  const conditions = [eq(transactions.userId, ctx.user.id)];

  if (!filters) {
    return conditions;
  }

  if (filters.accountId) {
    const accountCondition = or(
      eq(transactions.accountId, filters.accountId),
      eq(transactions.fromAccountId, filters.accountId),
      eq(transactions.toAccountId, filters.accountId)
    );
    if (accountCondition) {
      conditions.push(accountCondition);
    }
  }

  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }

  if (filters.startDate) {
    const [year, month, day] = filters.startDate.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    conditions.push(gte(transactions.date, startDate));
  }

  if (filters.endDate) {
    const [year, month, day] = filters.endDate.split("-").map(Number);
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    conditions.push(lte(transactions.date, endDate));
  }

  return conditions;
};

export const transactionsRouter = router({
  list: authedProcedure
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
    }),

  summary: authedProcedure
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
    }),

  periods: authedProcedure
    .output(
      z.object({
        availableMonths: z.array(z.object({ year: z.number(), month: z.number() })),
        availableYears: z.array(z.number()),
      })
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db.query.transactions.findMany({
        where: eq(transactions.userId, ctx.user.id),
        columns: {
          date: transactions.date,
        },
      });

      const months = new Set<string>();
      const years = new Set<number>();

      rows.forEach((row) => {
        if (!row.date) return;
        const date = new Date(row.date);
        if (Number.isNaN(date.getTime())) return;
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        years.add(year);
        months.add(`${year}-${month}`);
      });

      const availableMonths = Array.from(months)
        .map((key) => {
          const [year, month] = key.split("-").map(Number);
          return { year, month };
        })
        .sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          return b.month - a.month;
        });

      return {
        availableMonths,
        availableYears: Array.from(years).sort((a, b) => b - a),
      };
    }),

  create: authedProcedure
    .input(createTransactionInputSchema)
    .output(transactionOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate based on transaction type
      if (input.type === "income" || input.type === "expense") {
        if (!input.accountId) {
          throw new Error("Account is required for income/expense transactions");
        }
        if (!input.categoryId) {
          throw new Error("Category is required for income/expense transactions");
        }
      } else if (input.type === "transfer") {
        if (!input.fromAccountId || !input.toAccountId) {
          throw new Error("From and to accounts are required for transfer transactions");
        }
        if (input.fromAccountId === input.toAccountId) {
          throw new Error("From and to accounts must be different");
        }
      }

      // Validate fee usage
      if (input.fee && !(input.type === "expense" || input.type === "transfer")) {
        throw new Error("Fees are only supported for expense and transfer transactions");
      }

      // Convert amounts to cents
      const amountInCents = Math.round(input.amount * 100);
      const feeAmountInCents = input.fee ? Math.round(input.fee.amount * 100) : 0;

      // Parse date and time - combine date string (YYYY-MM-DD) with optional time (HH:mm)
      // Use UTC to ensure consistent storage regardless of server timezone
      const [year, month, day] = input.date.split("-").map(Number);
      let dateObj: Date;
      if (input.time) {
        const [hours, minutes] = input.time.split(":").map(Number);
        dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
      } else {
        dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      }

      const transactionId = createId();
      const feeTransactionId = input.fee ? createId() : null;

      // Handle attachment upload if provided
      let attachmentPath: string | null = null;
      let attachmentFileName: string | null = null;
      let attachmentMimeType: string | null = null;

      if (input.attachment) {
        const saved = await saveAttachment(ctx.user.id, transactionId, input.attachment);
        attachmentPath = saved.path;
        attachmentFileName = saved.fileName;
        attachmentMimeType = saved.mimeType;
      }

      // Create main transaction
      const [newTransaction] = await ctx.db
        .insert(transactions)
        .values({
          id: transactionId,
          userId: ctx.user.id,
          type: input.type,
          amount: amountInCents,
          accountId: input.accountId ?? null,
          categoryId: input.categoryId ?? null,
          fromAccountId: input.fromAccountId ?? null,
          toAccountId: input.toAccountId ?? null,
          date: dateObj,
          time: input.time ?? null,
          notes: input.notes ?? "",
          attachmentPath,
          attachmentFileName,
          attachmentMimeType,
          isFee: false,
        })
        .returning();

      if (!newTransaction) {
        throw new Error("Failed to create transaction");
      }

      // Optional fee transaction (separate, linked expense)
      if (input.fee && feeTransactionId) {
        // Determine source account for the fee
        const sourceAccountId =
          input.type === "transfer" ? input.fromAccountId! : input.accountId!;

        const feeAccountId = input.fee.accountId ?? sourceAccountId;

        // Resolve default fee category if none provided
        let feeCategoryId = input.fee.categoryId ?? null;
        if (!feeCategoryId) {
          const userCategories = await ctx.db.query.categories.findMany({
            where: eq(categories.userId, ctx.user.id),
          });
          const feeCategory = userCategories.find((cat) => {
            const name = cat.name.toLowerCase();
            return (
              name === "bank fees" ||
              name === "transaction fees" ||
              name === "fees"
            );
          });
          feeCategoryId = feeCategory?.id ?? null;
        }

        await ctx.db.insert(transactions).values({
          id: feeTransactionId,
          userId: ctx.user.id,
          type: "expense",
          amount: feeAmountInCents,
          accountId: feeAccountId,
          categoryId: feeCategoryId,
          fromAccountId: null,
          toAccountId: null,
          date: dateObj,
          time: input.time ?? null,
          notes: input.notes ? `Fee: ${input.notes}` : "Transaction fee",
          attachmentPath: null,
          attachmentFileName: null,
          attachmentMimeType: null,
          parentTransactionId: transactionId,
          isFee: true,
        });
      }

      // Update account balances
      if (input.type === "income") {
        // Increase account balance
        await ctx.db
          .update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} + ${amountInCents}`,
          })
          .where(eq(financialAccounts.id, input.accountId!));
      } else if (input.type === "expense") {
        // Decrease account balance
        await ctx.db
          .update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} - ${amountInCents}`,
          })
          .where(eq(financialAccounts.id, input.accountId!));
        if (input.fee) {
          const sourceAccountId = input.accountId!;
          const feeAccountId = input.fee.accountId ?? sourceAccountId;
          await ctx.db
            .update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${feeAmountInCents}`,
            })
            .where(eq(financialAccounts.id, feeAccountId));
        }
      } else if (input.type === "transfer") {
        // Decrease from account, increase to account
        await ctx.db
          .update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} - ${amountInCents}`,
          })
          .where(eq(financialAccounts.id, input.fromAccountId!));

        await ctx.db
          .update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} + ${amountInCents}`,
          })
          .where(eq(financialAccounts.id, input.toAccountId!));

        if (input.fee) {
          const sourceAccountId = input.fromAccountId!;
          const feeAccountId = input.fee.accountId ?? sourceAccountId;
          await ctx.db
            .update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${feeAmountInCents}`,
            })
            .where(eq(financialAccounts.id, feeAccountId));
        }
      }

      // Fetch category data if categoryId exists
      let categoryIcon: string | null = null;
      let categoryColor: string | null = null;
      if (newTransaction.categoryId) {
        const category = await ctx.db.query.categories.findFirst({
          where: eq(categories.id, newTransaction.categoryId),
        });
        if (category) {
          categoryIcon = category.icon;
          categoryColor = category.color;
        }
      }

      return {
        id: newTransaction.id,
        type: newTransaction.type as "income" | "expense" | "transfer",
        amount: newTransaction.amount ?? 0,
        accountId: newTransaction.accountId ?? null,
        categoryId: newTransaction.categoryId ?? null,
        categoryIcon,
        categoryColor,
        fromAccountId: newTransaction.fromAccountId ?? null,
        toAccountId: newTransaction.toAccountId ?? null,
        parentTransactionId: newTransaction.parentTransactionId ?? null,
        isFee: Boolean(newTransaction.isFee),
        date: new Date(newTransaction.date ?? Date.now()).toISOString(),
        time: newTransaction.time ?? null,
        notes: newTransaction.notes ?? "",
        attachmentPath: newTransaction.attachmentPath ?? null,
        attachmentFileName: newTransaction.attachmentFileName ?? null,
        attachmentMimeType: newTransaction.attachmentMimeType ?? null,
        createdAt: new Date(newTransaction.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(newTransaction.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["income", "expense", "transfer"]).optional(),
        amount: z.number().min(0.01).optional(),
        accountId: z.string().optional(),
        categoryId: z.string().optional(),
        fromAccountId: z.string().optional(),
        toAccountId: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        notes: z.string().optional(),
        fee: feeInputSchema,
        attachment: z
          .object({
            fileName: z.string(),
            mimeType: z.string(),
            data: z.string(),
          })
          .optional(),
      })
    )
    .output(transactionOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify transaction belongs to user
      const existing = await ctx.db.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, ctx.user.id)),
      });

      if (!existing) {
        throw new Error("Transaction not found");
      }

      // Guard: fees only for expense/transfer
      if (input.fee && !(existing.type === "expense" || existing.type === "transfer")) {
        throw new Error("Fees are only supported for expense and transfer transactions");
      }

      // Handle updates (this is simplified - in production you'd want to handle balance updates properly)
      const updateValues: any = {};

      if (updateData.amount !== undefined) {
        updateValues.amount = Math.round(updateData.amount * 100);
      }
      if (updateData.date !== undefined) {
        // Use UTC to ensure consistent storage regardless of server timezone
        const [year, month, day] = updateData.date.split("-").map(Number);
        let dateObj: Date;
        if (updateData.time) {
          const [hours, minutes] = updateData.time.split(":").map(Number);
          dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
        } else {
          dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        }
        updateValues.date = dateObj;
      }
      if (updateData.time !== undefined) {
        updateValues.time = updateData.time;
      }
      if (updateData.notes !== undefined) {
        updateValues.notes = updateData.notes;
      }
      if (updateData.type !== undefined) {
        updateValues.type = updateData.type;
      }
      if (updateData.accountId !== undefined) {
        updateValues.accountId = updateData.accountId;
      }
      if (updateData.categoryId !== undefined) {
        updateValues.categoryId = updateData.categoryId;
      }
      if (updateData.fromAccountId !== undefined) {
        updateValues.fromAccountId = updateData.fromAccountId;
      }
      if (updateData.toAccountId !== undefined) {
        updateValues.toAccountId = updateData.toAccountId;
      }

      // Handle attachment
      if (updateData.attachment) {
        // Delete old attachment if it exists and has a different path
        if (existing.attachmentPath) {
          try {
            await fs.unlink(existing.attachmentPath);
          } catch (error) {
            // Ignore errors if file doesn't exist
            console.warn("Failed to delete old attachment:", error);
          }
        }
        
        const saved = await saveAttachment(ctx.user.id, id, updateData.attachment);
        updateValues.attachmentPath = saved.path;
        updateValues.attachmentFileName = saved.fileName;
        updateValues.attachmentMimeType = saved.mimeType;
      }

      const [updated] = await ctx.db
        .update(transactions)
        .set(updateValues)
        .where(and(eq(transactions.id, id), eq(transactions.userId, ctx.user.id)))
        .returning();

      if (!updated) {
        throw new Error("Failed to update transaction");
      }

      // Handle fee update in a simplified way: create or update linked fee transaction if provided
      if (input.fee) {
        const feeAmountInCents = Math.round(input.fee.amount * 100);

        const sourceAccountId =
          (updated.type === "transfer" ? updated.fromAccountId : updated.accountId) ??
          existing.accountId ??
          existing.fromAccountId;

        const feeAccountId = input.fee.accountId ?? sourceAccountId;

        let feeCategoryId = input.fee.categoryId ?? null;
        if (!feeCategoryId) {
          const userCategories = await ctx.db.query.categories.findMany({
            where: eq(categories.userId, ctx.user.id),
          });
          const feeCategory = userCategories.find((cat) => {
            const name = cat.name.toLowerCase();
            return (
              name === "bank fees" ||
              name === "transaction fees" ||
              name === "fees"
            );
          });
          feeCategoryId = feeCategory?.id ?? null;
        }

        const existingFee = await ctx.db.query.transactions.findFirst({
          where: and(
            eq(transactions.parentTransactionId, id),
            eq(transactions.userId, ctx.user.id),
            eq(transactions.isFee, true)
          ),
        });

        if (existingFee) {
          await ctx.db
            .update(transactions)
            .set({
              amount: feeAmountInCents,
              accountId: feeAccountId,
              categoryId: feeCategoryId,
            })
            .where(eq(transactions.id, existingFee.id));
        } else {
          await ctx.db.insert(transactions).values({
            id: createId(),
            userId: ctx.user.id,
            type: "expense",
            amount: feeAmountInCents,
            accountId: feeAccountId,
            categoryId: feeCategoryId,
            fromAccountId: null,
            toAccountId: null,
            date: updated.date,
            time: updated.time,
            notes: updated.notes ? `Fee: ${updated.notes}` : "Transaction fee",
            attachmentPath: null,
            attachmentFileName: null,
            attachmentMimeType: null,
            parentTransactionId: updated.id,
            isFee: true,
          });
        }
      }

      // Fetch category data if categoryId exists
      let categoryIcon: string | null = null;
      let categoryColor: string | null = null;
      if (updated.categoryId) {
        const category = await ctx.db.query.categories.findFirst({
          where: eq(categories.id, updated.categoryId),
        });
        if (category) {
          categoryIcon = category.icon;
          categoryColor = category.color;
        }
      }

      return {
        id: updated.id,
        type: updated.type as "income" | "expense" | "transfer",
        amount: updated.amount ?? 0,
        accountId: updated.accountId ?? null,
        categoryId: updated.categoryId ?? null,
        categoryIcon,
        categoryColor,
        fromAccountId: updated.fromAccountId ?? null,
        toAccountId: updated.toAccountId ?? null,
        parentTransactionId: updated.parentTransactionId ?? null,
        isFee: Boolean(updated.isFee),
        date: new Date(updated.date ?? Date.now()).toISOString(),
        time: updated.time ?? null,
        notes: updated.notes ?? "",
        attachmentPath: updated.attachmentPath ?? null,
        attachmentFileName: updated.attachmentFileName ?? null,
        attachmentMimeType: updated.attachmentMimeType ?? null,
        createdAt: new Date(updated.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(updated.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify transaction belongs to user
      const existing = await ctx.db.query.transactions.findFirst({
        where: and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)),
      });

      if (!existing) {
        throw new Error("Transaction not found");
      }

      // Delete attachment if exists
      if (existing.attachmentPath) {
        try {
          await fs.unlink(existing.attachmentPath);
        } catch {
          // Ignore errors if file doesn't exist
        }
      }

      // Delete transaction
      await ctx.db
        .delete(transactions)
        .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)));

      // TODO: Update account balances (reverse the transaction)

      return { success: true };
    }),
});

