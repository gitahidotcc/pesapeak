import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import fs from "node:fs/promises";
import { transactions } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";
import { reverseTransactionBalanceEffects, runTransaction } from "./utils";

export const deleteProcedure = authedProcedure
  .input(z.object({ id: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    // Pre-fetch transaction data and linked fees before starting transaction
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

    // Store attachment paths before deletion (for cleanup after transaction succeeds)
    const attachmentPaths: string[] = [];
    if (existing.attachmentPath) {
      attachmentPaths.push(existing.attachmentPath);
    }
    for (const feeTx of linkedFees) {
      if (feeTx.attachmentPath) {
        attachmentPaths.push(feeTx.attachmentPath);
      }
    }

    // Wrap all database operations in a transaction for atomicity
    await runTransaction(
      ctx.db,
      async () => {
        return {
          existing,
          linkedFees,
        };
      },
      (tx, preFetched) => {
        const allTransactionsToReverse = [preFetched.existing, ...preFetched.linkedFees];

        // Reverse account balance effects for the transaction and any linked fees
        reverseTransactionBalanceEffects(tx, allTransactionsToReverse);

        // Delete transaction and any linked fee transactions
        tx.delete(transactions)
          .where(
            and(
              eq(transactions.userId, ctx.user.id),
              or(
                eq(transactions.id, input.id),
                eq(transactions.parentTransactionId, input.id)
              )
            )
          )
          .run();
      }
    );

    // Delete attachments after database transaction succeeds (file system operation)
    // This ensures database consistency even if file deletion fails
    for (const attachmentPath of attachmentPaths) {
      try {
        await fs.unlink(attachmentPath);
      } catch (error) {
        // Ignore errors if file doesn't exist or deletion fails
        // Database transaction already succeeded, so we log but don't fail
        console.warn("Failed to delete attachment file:", attachmentPath, error);
      }
    }

    return { success: true };
  });
