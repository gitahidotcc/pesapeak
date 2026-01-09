import { and, eq, gte, lte, or } from "drizzle-orm";
import { transactions } from "@pesapeak/db/schema";
import type { AuthedContext } from "../../index";
import fs from "node:fs/promises";
import path from "node:path";
import config from "@pesapeak/shared/config";
import type { TransactionFilters } from "./schemas";

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
  filters?: TransactionFilters
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

  return conditions;
}
