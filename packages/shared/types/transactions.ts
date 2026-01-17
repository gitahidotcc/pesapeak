/**
 * Shared Transaction types
 * Based on the tRPC transactionOutputSchema
 */

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored in cents
  accountId: string | null;
  categoryId: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  // Fee / linked-transaction metadata
  parentTransactionId: string | null;
  isFee: boolean;
  date: string; // ISO date string
  time: string | null; // HH:mm format or null
  notes: string;
  attachmentPath: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
