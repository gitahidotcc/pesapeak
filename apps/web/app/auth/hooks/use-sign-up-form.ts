import { useState } from "react";
import { TRPCClientError } from "@trpc/client";
import { useAuthForm } from "./use-auth-form";
import { useSignUpMutation } from "./use-auth-mutations";
import { signUpSchema, type SignUpFormData } from "../validations/auth";

const initialFormData: SignUpFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function useSignUpForm() {
  const form = useAuthForm(initialFormData, signUpSchema);
  const mutation = useSignUpMutation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { valid } = form.validate();
    if (!valid) {
      return;
    }

    try {
      await mutation.mutateAsync(form.formData);
    } catch (err) {
      // Extract user-friendly error message
      if (err instanceof TRPCClientError) {
        setError(err.message || "An error occurred during sign up. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Clear error when user starts typing
  const updateField = (field: keyof SignUpFormData, value: string) => {
    if (error) {
      setError(null);
    }
    form.updateField(field, value);
  };

  return {
    ...form,
    formData: form.formData,
    errors: form.errors,
    updateField,
    mutation,
    handleSubmit,
    isLoading: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}

