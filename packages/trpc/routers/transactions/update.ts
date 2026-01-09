import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import fs from "node:fs/promises";
import { transactions, financialAccounts, categories } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";
import { feeInputSchema, transactionOutputSchema } from "./schemas";
import { saveAttachment } from "./utils";
import { createId } from "@paralleldrive/cuid2";

export const update = authedProcedure
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
      removeAttachment: z.boolean().optional(),
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

    // Handle attachment outside transaction (file system operation)
    let attachmentPath: string | null = null;
    let attachmentFileName: string | null = null;
    let attachmentMimeType: string | null = null;

    if (updateData.attachment || updateData.removeAttachment) {
      // Delete old attachment file if it exists
      if (existing.attachmentPath) {
        try {
          await fs.unlink(existing.attachmentPath);
        } catch (error) {
          // Ignore errors if file doesn't exist
          console.warn("Failed to delete old attachment:", error);
        }
      }
    }

    if (updateData.attachment) {
      const saved = await saveAttachment(ctx.user.id, id, updateData.attachment);
      attachmentPath = saved.path;
      attachmentFileName = saved.fileName;
      attachmentMimeType = saved.mimeType;
    }

    // Pre-fetch data needed for the transaction (existing fees and categories)
    const existingFees = await ctx.db.query.transactions.findMany({
      where: and(
        eq(transactions.parentTransactionId, id),
        eq(transactions.userId, ctx.user.id),
        eq(transactions.isFee, true)
      ),
    });

    // Pre-fetch fee category if needed
    let feeCategoryId: string | null = null;
    if (input.fee && !input.fee.categoryId) {
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
    } else if (input.fee) {
      feeCategoryId = input.fee.categoryId ?? null;
    }

    // Wrap all database operations in a transaction for atomicity
    // Note: With better-sqlite3, we need to use synchronous operations
    // All queries have been pre-fetched above
    ctx.db.transaction((tx) => {
      const originalTransactions = [existing, ...existingFees];

      // Reverse original balance effects for the main transaction and any linked fee transactions
      for (const txRecord of originalTransactions) {
        if (txRecord.type === "income" && txRecord.accountId) {
          tx.update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
            })
            .where(eq(financialAccounts.id, txRecord.accountId))
            .run();
        } else if (txRecord.type === "expense" && txRecord.accountId) {
          tx.update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
            })
            .where(eq(financialAccounts.id, txRecord.accountId))
            .run();
        } else if (txRecord.type === "transfer") {
          if (txRecord.fromAccountId) {
            tx.update(financialAccounts)
              .set({
                totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
              })
              .where(eq(financialAccounts.id, txRecord.fromAccountId))
              .run();
          }

          if (txRecord.toAccountId) {
            tx.update(financialAccounts)
              .set({
                totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
              })
              .where(eq(financialAccounts.id, txRecord.toAccountId))
              .run();
          }
        }
      }

      // Handle field updates
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

      // Handle attachment path if provided or removed
      if (updateData.attachment) {
        updateValues.attachmentPath = attachmentPath;
        updateValues.attachmentFileName = attachmentFileName;
        updateValues.attachmentMimeType = attachmentMimeType;
      } else if (updateData.removeAttachment) {
        // Clear attachment metadata in DB when explicitly removing attachment
        updateValues.attachmentPath = null;
        updateValues.attachmentFileName = null;
        updateValues.attachmentMimeType = null;
      }

      const [updatedTx] = tx
        .update(transactions)
        .set(updateValues)
        .where(and(eq(transactions.id, id), eq(transactions.userId, ctx.user.id)))
        .returning()
        .all();

      if (!updatedTx) {
        throw new Error("Failed to update transaction");
      }

      // Handle fee update: create/update/delete linked fee transaction and re-apply its balance effect
      if (input.fee) {
        const feeAmountInCents = Math.round(input.fee.amount * 100);

        const sourceAccountId =
          (updatedTx.type === "transfer" ? updatedTx.fromAccountId : updatedTx.accountId) ??
          existing.accountId ??
          existing.fromAccountId;

        const feeAccountId = input.fee.accountId ?? sourceAccountId;

        // feeCategoryId was pre-fetched above
        const existingFee = existingFees[0];

        if (existingFee) {
          tx.update(transactions)
            .set({
              amount: feeAmountInCents,
              accountId: feeAccountId,
              categoryId: feeCategoryId,
            })
            .where(eq(transactions.id, existingFee.id))
            .run();
        } else {
          tx.insert(transactions).values({
            id: createId(),
            userId: ctx.user.id,
            type: "expense",
            amount: feeAmountInCents,
            accountId: feeAccountId,
            categoryId: feeCategoryId,
            fromAccountId: null,
            toAccountId: null,
            date: updatedTx.date,
            time: updatedTx.time,
            notes: updatedTx.notes ? `Fee: ${updatedTx.notes}` : "Transaction fee",
            attachmentPath: null,
            attachmentFileName: null,
            attachmentMimeType: null,
            parentTransactionId: updatedTx.id,
            isFee: true,
          }).run();
        }

        // Apply new fee balance effect (expense from fee account)
        if (feeAccountId) {
          tx.update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${feeAmountInCents}`,
            })
            .where(eq(financialAccounts.id, feeAccountId))
            .run();
        }
      } else if (!input.fee && existingFees.length > 0) {
        // Fee removed: delete existing fee transactions (their balance effect was already reversed)
        tx.delete(transactions)
          .where(
            and(
              eq(transactions.userId, ctx.user.id),
              eq(transactions.parentTransactionId, id),
              eq(transactions.isFee, true)
            )
          )
          .run();
      }

      // Apply new balance effects for the updated main transaction
      if (updatedTx.type === "income" && updatedTx.accountId) {
        tx.update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} + ${updatedTx.amount}`,
          })
          .where(eq(financialAccounts.id, updatedTx.accountId))
          .run();
      } else if (updatedTx.type === "expense" && updatedTx.accountId) {
        tx.update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} - ${updatedTx.amount}`,
          })
          .where(eq(financialAccounts.id, updatedTx.accountId))
          .run();
      } else if (updatedTx.type === "transfer") {
        if (updatedTx.fromAccountId) {
          tx.update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${updatedTx.amount}`,
            })
            .where(eq(financialAccounts.id, updatedTx.fromAccountId))
            .run();
        }

        if (updatedTx.toAccountId) {
          tx.update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} + ${updatedTx.amount}`,
            })
            .where(eq(financialAccounts.id, updatedTx.toAccountId))
            .run();
        }
      }
    });

    // Fetch the updated transaction after the transaction completes
    const updated = await ctx.db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, ctx.user.id)),
    });

    if (!updated) {
      throw new Error("Failed to retrieve updated transaction");
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
  });
