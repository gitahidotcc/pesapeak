import { z } from "zod";

// Shared date validation helper
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value: string): boolean => {
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const filterDateSchema = z
  .string()
  .regex(dateRegex, "Date must be in YYYY-MM-DD format")
  .refine(isValidDateString, {
    message: "Date must be a valid calendar date",
  });

export const transactionOutputSchema = z.object({
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
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional(),
  })).default([]),
});

export const feeInputSchema = z
  .object({
    amount: z.number().min(0.01, "Fee amount must be greater than 0"),
    accountId: z.string().optional(),
    categoryId: z.string().optional(),
  })
  .optional();

export const createTransactionInputSchema = z.object({
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
  tags: z.array(z.string()).optional(), // Array of tag IDs
});

export const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  startDate: filterDateSchema.optional(),
  endDate: filterDateSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const listInputSchema = transactionFiltersSchema.extend({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.number().min(0).optional(),
  search: z.string().optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
