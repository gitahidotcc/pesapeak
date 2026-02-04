export type TransactionType = "income" | "expense" | "transfer";

export type ExistingAttachment = {
  url: string;
  fileName: string;
  mimeType: string;
};

export type TransactionFormData = {
  amount: string;
  type: TransactionType;
  accountId: string; // For income/expense
  fromAccountId: string; // For transfer
  toAccountId: string; // For transfer
  categoryId: string;
  // Optional fee (only for expense/transfer)
  hasFee: boolean;
  feeAmount: string;
  feeCategoryId: string;
  date: string; // ISO date string
  time: string; // HH:mm format or empty
  includeTime: boolean;
  notes: string;
  attachment: File | null;
  existingAttachment: ExistingAttachment | null;
  tags: string[];
};

export type TransactionFormErrors = Partial<Record<keyof TransactionFormData, string>>;

