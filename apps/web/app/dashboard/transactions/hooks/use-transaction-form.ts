"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import type { TransactionFormData, TransactionType } from "../types/transaction";
import { validateTransactionForm } from "../validations/transaction-form";
import { fileToBase64 } from "../utils/file-upload";

const getInitialFormData = (): TransactionFormData => {
  // Use local timezone for date and time
  const now = new Date();
  
  // Get local date in YYYY-MM-DD format
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;
  
  // Get local time in HH:mm format
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  return {
    amount: "",
    type: "expense",
    accountId: "",
    fromAccountId: "",
    toAccountId: "",
    categoryId: "",
    date,
    time,
    includeTime: true, // Prefill time by default
    notes: "",
    attachment: null,
  };
};

export function useTransactionForm() {
  const [formData, setFormData] = useState<TransactionFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: folders } = api.categories.list.useQuery();

  const updateField = useCallback(
    <K extends keyof TransactionFormData>(field: K, value: TransactionFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setTransactionType = useCallback(
    (type: TransactionType) => {
      updateField("type", type);
    },
    [updateField]
  );

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, []);

  const utils = api.useUtils();
  const createTransaction = api.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created successfully");
      utils.transactions.list.invalidate();
      utils.accounts.list.invalidate(); // Refresh account balances
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });

  const validate = useCallback(() => {
    const validation = validateTransactionForm(formData);
    setErrors(validation.errors);
    return validation.success;
  }, [formData]);

  const submit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      // Convert file to base64 if present
      let attachment: { fileName: string; mimeType: string; data: string } | undefined;
      if (formData.attachment) {
        const base64 = await fileToBase64(formData.attachment);
        attachment = {
          fileName: formData.attachment.name,
          mimeType: formData.attachment.type,
          data: base64,
        };
      }

      // Convert amount string to number
      const amount = parseFloat(formData.amount);

      await createTransaction.mutateAsync({
        type: formData.type,
        amount,
        accountId: formData.accountId || undefined,
        categoryId: formData.categoryId || undefined,
        fromAccountId: formData.fromAccountId || undefined,
        toAccountId: formData.toAccountId || undefined,
        date: formData.date,
        time: formData.includeTime && formData.time ? formData.time : undefined,
        notes: formData.notes || undefined,
        attachment,
      });
    } catch (error) {
      // Error is handled by mutation onError
      console.error("Transaction submission error:", error);
    }
  }, [formData, validate, createTransaction]);

  // Get default account if available
  const defaultAccount = accounts?.find((acc) => acc.defaultAccount);

  // Flatten categories from folders
  const allCategories =
    folders?.flatMap((folder) =>
      folder.categories.map((cat) => ({
        ...cat,
        folderName: folder.name,
        folderColor: folder.color,
      }))
    ) || [];

  return {
    formData,
    errors,
    accounts: accounts || [],
    categories: allCategories,
    defaultAccount,
    updateField,
    setTransactionType,
    resetForm,
    validate,
    submit,
    isSubmitting: createTransaction.isPending,
  };
}

