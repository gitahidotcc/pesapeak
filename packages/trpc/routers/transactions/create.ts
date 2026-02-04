import { eq } from "drizzle-orm";
import { transactions, categories, transactionTags } from "@pesapeak/db/schema";
import { authedProcedure } from "../../index";
import { createTransactionInputSchema, transactionOutputSchema } from "./schemas";
import {
  saveAttachment,
  runTransaction,
  applyTransactionBalanceEffects,
} from "./utils";
import { createId } from "@paralleldrive/cuid2";

export const create = authedProcedure
  .input(createTransactionInputSchema)
  .output(transactionOutputSchema)
  .mutation(async ({ ctx, input }) => {
    // Validate based on transaction type
    if (input.type === "income" || input.type === "expense") {
      if (!input.accountId) {
        throw new Error("Account is required for income/expense transactions");
      }
      if (!input.categoryId) {
        throw new Error("Category is required for income/expense transactions");
      }
    } else if (input.type === "transfer") {
      if (!input.fromAccountId || !input.toAccountId) {
        throw new Error("From and to accounts are required for transfer transactions");
      }
      if (input.fromAccountId === input.toAccountId) {
        throw new Error("From and to accounts must be different");
      }
    }

    // Validate fee usage
    if (input.fee && !(input.type === "expense" || input.type === "transfer")) {
      throw new Error("Fees are only supported for expense and transfer transactions");
    }

    // Convert amounts to cents
    const amountInCents = Math.round(input.amount * 100);
    const feeAmountInCents = input.fee ? Math.round(input.fee.amount * 100) : 0;

    // Parse date and time - combine date string (YYYY-MM-DD) with optional time (HH:mm)
    // Use UTC to ensure consistent storage regardless of server timezone
    const [year, month, day] = input.date.split("-").map(Number);
    let dateObj: Date;
    if (input.time) {
      const [hours, minutes] = input.time.split(":").map(Number);
      dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    } else {
      dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    const transactionId = createId();
    const feeTransactionId = input.fee ? createId() : null;

    // Handle attachment upload if provided (file system operation, outside transaction)
    let attachmentPath: string | null = null;
    let attachmentFileName: string | null = null;
    let attachmentMimeType: string | null = null;

    if (input.attachment) {
      const saved = await saveAttachment(ctx.user.id, transactionId, input.attachment);
      attachmentPath = saved.path;
      attachmentFileName = saved.fileName;
      attachmentMimeType = saved.mimeType;
    }

    // Pre-fetch fee category if needed (before transaction)
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
    const newTransaction = await runTransaction(
      ctx.db,
      async () => {
        // Pre-fetch complete - return data needed for transaction
        return {
          feeCategoryId,
          feeTransactionId,
          attachmentPath,
          attachmentFileName,
          attachmentMimeType,
        };
      },
      (tx, preFetched) => {
        // Create main transaction
        const [created] = tx
          .insert(transactions)
          .values({
            id: transactionId,
            userId: ctx.user.id,
            type: input.type,
            amount: amountInCents,
            accountId: input.accountId ?? null,
            categoryId: input.categoryId ?? null,
            fromAccountId: input.fromAccountId ?? null,
            toAccountId: input.toAccountId ?? null,
            date: dateObj,
            time: input.time ?? null,
            notes: input.notes ?? "",
            attachmentPath: preFetched.attachmentPath,
            attachmentFileName: preFetched.attachmentFileName,
            attachmentMimeType: preFetched.attachmentMimeType,
            isFee: false,
          })
          .returning()
          .all();

        if (!created) {
          throw new Error("Failed to create transaction");
        }

        // Optional fee transaction (separate, linked expense)
        if (input.fee && preFetched.feeTransactionId) {
          // Determine source account for the fee
          const sourceAccountId =
            input.type === "transfer" ? input.fromAccountId! : input.accountId!;

          const feeAccountId = input.fee.accountId ?? sourceAccountId;

          tx.insert(transactions)
            .values({
              id: preFetched.feeTransactionId,
              userId: ctx.user.id,
              type: "expense",
              amount: feeAmountInCents,
              accountId: feeAccountId,
              categoryId: preFetched.feeCategoryId,
              fromAccountId: null,
              toAccountId: null,
              date: dateObj,
              time: input.time ?? null,
              notes: input.notes ? `Fee: ${input.notes}` : "Transaction fee",
              attachmentPath: null,
              attachmentFileName: null,
              attachmentMimeType: null,
              parentTransactionId: transactionId,
              isFee: true,
            })
            .run();
        }

        // Apply balance effects for the main transaction
        applyTransactionBalanceEffects(tx, {
          type: input.type,
          amount: amountInCents,
          accountId: input.accountId ?? null,
          fromAccountId: input.fromAccountId ?? null,
          toAccountId: input.toAccountId ?? null,
        });

        // Apply balance effects for fee if present
        if (input.fee) {
          const sourceAccountId =
            input.type === "transfer" ? input.fromAccountId! : input.accountId!;
          const feeAccountId = input.fee.accountId ?? sourceAccountId;

          if (feeAccountId) {
            applyTransactionBalanceEffects(tx, {
              type: "expense",
              amount: feeAmountInCents,
              accountId: feeAccountId,
              fromAccountId: null,
              toAccountId: null,
            });
          }
        }

        if (input.tags && input.tags.length > 0) {
          const tagValues = input.tags.map(tagId => ({
            transactionId,
            tagId,
          }));
          tx.insert(transactionTags).values(tagValues).run();
        }

        return created;
      }
    );

    if (!newTransaction) {
      throw new Error("Failed to create transaction");
    }

    // Fetch category data if categoryId exists
    let categoryIcon: string | null = null;
    let categoryColor: string | null = null;
    if (newTransaction.categoryId) {
      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.id, newTransaction.categoryId),
      });
      if (category) {
        categoryIcon = category.icon;
        categoryColor = category.color;
      }
    }

    // Fetch tags
    const transactionTagsData = await ctx.db.query.transactionTags.findMany({
      where: eq(transactionTags.transactionId, newTransaction.id),
      with: {
        tag: true,
      }
    });

    const tagsList = transactionTagsData.map(tt => ({
      id: tt.tag.id,
      name: tt.tag.name,
      type: tt.tag.type ?? undefined,
    }));

    return {
      id: newTransaction.id,
      type: newTransaction.type as "income" | "expense" | "transfer",
      amount: newTransaction.amount ?? 0,
      accountId: newTransaction.accountId ?? null,
      categoryId: newTransaction.categoryId ?? null,
      categoryIcon,
      categoryColor,
      fromAccountId: newTransaction.fromAccountId ?? null,
      toAccountId: newTransaction.toAccountId ?? null,
      parentTransactionId: newTransaction.parentTransactionId ?? null,
      isFee: Boolean(newTransaction.isFee),
      date: new Date(newTransaction.date ?? Date.now()).toISOString(),
      time: newTransaction.time ?? null,
      notes: newTransaction.notes ?? "",
      attachmentPath: newTransaction.attachmentPath ?? null,
      attachmentFileName: newTransaction.attachmentFileName ?? null,
      attachmentMimeType: newTransaction.attachmentMimeType ?? null,
      createdAt: new Date(newTransaction.createdAt ?? Date.now()).toISOString(),
      updatedAt: new Date(newTransaction.updatedAt ?? Date.now()).toISOString(),
      tags: tagsList,
    };
  });
