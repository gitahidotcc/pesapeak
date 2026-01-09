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
    // Wrap all database operations in a transaction for atomicity
    await runTransaction(
      ctx.db,
      async () => {
        // Verify transaction belongs to user and load linked fees
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

    return { success: true };
  });
