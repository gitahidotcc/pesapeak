import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthForm } from "./use-auth-form";
import { useResetPasswordMutation } from "./use-auth-mutations";
import { resetPasswordSchema, type ResetPasswordFormData } from "../validations/auth";

export function useResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const initialFormData: ResetPasswordFormData = {
    token: token || "",
    password: "",
    confirmPassword: "",
  };

  const form = useAuthForm(initialFormData, resetPasswordSchema);
  const mutation = useResetPasswordMutation();
  const [success, setSuccess] = useState(false);

  // Update token when URL changes
  useEffect(() => {
    if (token && form.formData.token !== token) {
      form.updateField("token", token);
    }
  }, [token, form.formData.token, form.updateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { valid } = form.validate();
    if (!valid) {
      return;
    }

    try {
      await mutation.mutateAsync(form.formData);
      setSuccess(true);
    } catch (error) {
      // Errors are handled by the mutation and form validation
      console.error("Reset password error:", error);
    }
  };

  return {
    ...form,
    mutation,
    handleSubmit,
    success,
    token,
    isLoading: mutation.isPending,
  };
}

