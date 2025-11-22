import { z } from "zod";
import type { TransactionFormData } from "../types/transaction";

export const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  type: z.enum(["income", "expense", "transfer"]),
  accountId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  includeTime: z.boolean().default(false),
  notes: z.string().optional(),
  attachment: z.instanceof(File).nullable().optional(),
}).superRefine((data, ctx) => {
  // For income/expense, accountId and categoryId are required
  if (data.type === "income" || data.type === "expense") {
    if (!data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account is required",
        path: ["accountId"],
      });
    }
    if (!data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Category is required",
        path: ["categoryId"],
      });
    }
  }
  // For transfer, fromAccountId and toAccountId are required
  if (data.type === "transfer") {
    if (!data.fromAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "From account is required",
        path: ["fromAccountId"],
      });
    }
    if (!data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "To account is required",
        path: ["toAccountId"],
      });
    }
    if (data.fromAccountId && data.toAccountId && data.fromAccountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "From and to accounts must be different",
        path: ["toAccountId"],
      });
    }
  }
});

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>;

export function validateTransactionForm(
  data: TransactionFormData
): { success: boolean; errors: Partial<Record<keyof TransactionFormData, string>> } {
  try {
    transactionFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof TransactionFormData, string>> = {};
      error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof TransactionFormData;
        if (path) {
          errors[path] = issue.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: {} };
  }
}

