import { and, eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import fs from "node:fs/promises";
import { transactions, financialAccounts } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";

export const deleteProcedure = authedProcedure
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

    // Load any linked fee transactions
    const linkedFees = await ctx.db.query.transactions.findMany({
      where: and(
        eq(transactions.parentTransactionId, existing.id),
        eq(transactions.userId, ctx.user.id),
        eq(transactions.isFee, true)
      ),
    });

    const allTransactionsToReverse = [existing, ...linkedFees];

    // Delete attachments if they exist (file system operation, outside transaction)
    if (existing.attachmentPath) {
      try {
        await fs.unlink(existing.attachmentPath);
      } catch {
        // Ignore errors if file doesn't exist
      }
    }

    for (const feeTx of linkedFees) {
      if (feeTx.attachmentPath) {
        try {
          await fs.unlink(feeTx.attachmentPath);
        } catch {
          // Ignore errors if file doesn't exist
        }
      }
    }

    // Wrap all database operations in a transaction for atomicity
    await ctx.db.transaction(async (tx) => {
      // Reverse account balance effects for the transaction and any linked fees
      for (const txRecord of allTransactionsToReverse) {
        if (txRecord.type === "income" && txRecord.accountId) {
          await tx
            .update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
            })
            .where(eq(financialAccounts.id, txRecord.accountId));
        } else if (txRecord.type === "expense" && txRecord.accountId) {
          await tx
            .update(financialAccounts)
            .set({
              totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
            })
            .where(eq(financialAccounts.id, txRecord.accountId));
        } else if (txRecord.type === "transfer") {
          if (txRecord.fromAccountId) {
            await tx
              .update(financialAccounts)
              .set({
                totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
              })
              .where(eq(financialAccounts.id, txRecord.fromAccountId));
          }

          if (txRecord.toAccountId) {
            await tx
              .update(financialAccounts)
              .set({
                totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
              })
              .where(eq(financialAccounts.id, txRecord.toAccountId));
          }
        }
      }

      // Delete transaction and any linked fee transactions
      await tx
        .delete(transactions)
        .where(
          and(
            eq(transactions.userId, ctx.user.id),
            or(eq(transactions.id, input.id), eq(transactions.parentTransactionId, input.id))
          )
        );
    });

    return { success: true };
  });
