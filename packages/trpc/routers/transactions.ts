import { and, desc, eq, sql, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { transactions, financialAccounts } from "@pesapeak/db/schema";
import { authedProcedure, router } from "../index";
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
  fromAccountId: z.string().nullable(),
  toAccountId: z.string().nullable(),
  date: z.string(),
  time: z.string().nullable(),
  notes: z.string(),
  attachmentPath: z.string().nullable(),
  attachmentFileName: z.string().nullable(),
  attachmentMimeType: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

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

export const transactionsRouter = router({
  list: authedProcedure
    .input(
      z
        .object({
          accountId: z.string().optional(),
          categoryId: z.string().optional(),
          type: z.enum(["income", "expense", "transfer"]).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .output(z.array(transactionOutputSchema))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(transactions.userId, ctx.user.id)];


      if (input?.accountId) {
        conditions.push(eq(transactions.accountId, input.accountId));
      }
      if (input?.categoryId) {
        conditions.push(eq(transactions.categoryId, input.categoryId));
      }
      if (input?.type) {
        conditions.push(eq(transactions.type, input.type));
      }
      if (input?.startDate) {
        // Parse date string as UTC to avoid timezone issues
        const [year, month, day] = input.startDate.split("-").map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        // Use gte with Date object - transactions.date is a Date object (mode: "timestamp")
        conditions.push(gte(transactions.date, startDate));
      }
      if (input?.endDate) {
        // Parse date string as UTC to avoid timezone issues
        const [year, month, day] = input.endDate.split("-").map(Number);
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        // Use lte with Date object - transactions.date is a Date object (mode: "timestamp")
        conditions.push(lte(transactions.date, endDate));
      }

      const results = await ctx.db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: (transaction) => desc(transaction.date),
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });


      return results.map((transaction) => ({
        id: transaction.id,
        type: transaction.type as "income" | "expense" | "transfer",
        amount: transaction.amount ?? 0,
        accountId: transaction.accountId ?? null,
        categoryId: transaction.categoryId ?? null,
        fromAccountId: transaction.fromAccountId ?? null,
        toAccountId: transaction.toAccountId ?? null,
        date: new Date(transaction.date ?? Date.now()).toISOString(),
        time: transaction.time ?? null,
        notes: transaction.notes ?? "",
        attachmentPath: transaction.attachmentPath ?? null,
        attachmentFileName: transaction.attachmentFileName ?? null,
        attachmentMimeType: transaction.attachmentMimeType ?? null,
        createdAt: new Date(transaction.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(transaction.updatedAt ?? Date.now()).toISOString(),
      }));
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

      // Convert amount to cents
      const amountInCents = Math.round(input.amount * 100);

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

      // Create transaction
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
        })
        .returning();

      if (!newTransaction) {
        throw new Error("Failed to create transaction");
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
      }

      return {
        id: newTransaction.id,
        type: newTransaction.type as "income" | "expense" | "transfer",
        amount: newTransaction.amount ?? 0,
        accountId: newTransaction.accountId ?? null,
        categoryId: newTransaction.categoryId ?? null,
        fromAccountId: newTransaction.fromAccountId ?? null,
        toAccountId: newTransaction.toAccountId ?? null,
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

      return {
        id: updated.id,
        type: updated.type as "income" | "expense" | "transfer",
        amount: updated.amount ?? 0,
        accountId: updated.accountId ?? null,
        categoryId: updated.categoryId ?? null,
        fromAccountId: updated.fromAccountId ?? null,
        toAccountId: updated.toAccountId ?? null,
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

