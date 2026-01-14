import { and, eq, gte, lte, or, sql, like } from "drizzle-orm";
import { transactions, financialAccounts, categories } from "@pesapeak/db/schema";
import type { AuthedContext } from "../../index";
import type { PesapeakDBTransaction, DB } from "@pesapeak/db";
import fs from "node:fs/promises";
import path from "node:path";
import config from "@pesapeak/shared/config";
import type { TransactionFilters } from "./schemas";

type TransactionRecord = {
  type: "income" | "expense" | "transfer";
  amount: number;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
};

export async function saveAttachment(
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

export function buildTransactionConditions(
  ctx: AuthedContext,
  filters?: TransactionFilters & { search?: string }
) {
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

  // Note: Search is now handled in list.ts using LEFT JOINs for better performance
  // This function no longer handles search to avoid conflicts with the relational query API

  return conditions;
}

/**
 * Reverses the balance effects of one or more transactions.
 * Used when updating or deleting transactions to undo their previous balance impact.
 * 
 * @param tx - The synchronous database transaction
 * @param txRecords - Array of transaction records to reverse
 */
export function reverseTransactionBalanceEffects(
  tx: PesapeakDBTransaction,
  txRecords: TransactionRecord[]
) {
  for (const txRecord of txRecords) {
    if (txRecord.type === "income" && txRecord.accountId) {
      // Income increased balance, so reverse by subtracting
      tx.update(financialAccounts)
        .set({
          totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
        })
        .where(eq(financialAccounts.id, txRecord.accountId))
        .run();
    } else if (txRecord.type === "expense" && txRecord.accountId) {
      // Expense decreased balance, so reverse by adding
      tx.update(financialAccounts)
        .set({
          totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
        })
        .where(eq(financialAccounts.id, txRecord.accountId))
        .run();
    } else if (txRecord.type === "transfer") {
      // Transfer: reverse by undoing the from/to account changes
      if (txRecord.fromAccountId) {
        // From account was decreased, so reverse by adding
        tx.update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
          })
          .where(eq(financialAccounts.id, txRecord.fromAccountId))
          .run();
      }

      if (txRecord.toAccountId) {
        // To account was increased, so reverse by subtracting
        tx.update(financialAccounts)
          .set({
            totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
          })
          .where(eq(financialAccounts.id, txRecord.toAccountId))
          .run();
      }
    }
  }
}

/**
 * Applies the balance effects of a transaction to the relevant accounts.
 * Used when creating or updating transactions to apply their balance impact.
 * 
 * @param tx - The synchronous database transaction
 * @param txRecord - Transaction record to apply balance effects for
 */
export function applyTransactionBalanceEffects(
  tx: PesapeakDBTransaction,
  txRecord: TransactionRecord
) {
  if (txRecord.type === "income" && txRecord.accountId) {
    // Income increases account balance
    tx.update(financialAccounts)
      .set({
        totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
      })
      .where(eq(financialAccounts.id, txRecord.accountId))
      .run();
  } else if (txRecord.type === "expense" && txRecord.accountId) {
    // Expense decreases account balance
    tx.update(financialAccounts)
      .set({
        totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
      })
      .where(eq(financialAccounts.id, txRecord.accountId))
      .run();
  } else if (txRecord.type === "transfer") {
    // Transfer: decrease from account, increase to account
    if (txRecord.fromAccountId) {
      tx.update(financialAccounts)
        .set({
          totalBalance: sql`${financialAccounts.totalBalance} - ${txRecord.amount}`,
        })
        .where(eq(financialAccounts.id, txRecord.fromAccountId))
        .run();
    }

    if (txRecord.toAccountId) {
      tx.update(financialAccounts)
        .set({
          totalBalance: sql`${financialAccounts.totalBalance} + ${txRecord.amount}`,
        })
        .where(eq(financialAccounts.id, txRecord.toAccountId))
        .run();
    }
  }
}

/**
 * Wrapper for running synchronous transactions with better-sqlite3.
 * Handles the pattern of pre-fetching async data before executing a synchronous transaction.
 * 
 * @param db - The database instance
 * @param preFetch - Async function that pre-fetches any data needed for the transaction
 * @param transactionFn - Synchronous transaction callback that receives pre-fetched data and transaction object
 * @returns The result from the transaction callback
 * 
 * @example
 * ```ts
 * const result = await runTransaction(
 *   ctx.db,
 *   async () => {
 *     const existing = await ctx.db.query.transactions.findFirst(...);
 *     return { existing };
 *   },
 *   (tx, { existing }) => {
 *     // Synchronous operations using tx
 *     tx.update(transactions).set({...}).where(...).run();
 *     return someResult;
 *   }
 * );
 * ```
 */
export async function runTransaction<TPreFetch, TResult>(
  db: DB,
  preFetch: () => Promise<TPreFetch>,
  transactionFn: (tx: PesapeakDBTransaction, preFetched: TPreFetch) => TResult
): Promise<TResult> {
  // Pre-fetch all async data before starting the transaction
  const preFetched = await preFetch();

  // Execute synchronous transaction
  return db.transaction((tx) => {
    return transactionFn(tx, preFetched);
  });
}
