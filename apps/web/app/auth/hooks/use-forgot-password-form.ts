import { useState } from "react";
import { useAuthForm } from "./use-auth-form";
import { useForgotPasswordMutation } from "./use-auth-mutations";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../validations/auth";

const initialFormData: ForgotPasswordFormData = {
  email: "",
};

export function useForgotPasswordForm() {
  const form = useAuthForm(initialFormData, forgotPasswordSchema);
  const mutation = useForgotPasswordMutation();
  const [success, setSuccess] = useState(false);

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
      console.error("Forgot password error:", error);
    }
  };

  return {
    ...form,
    mutation,
    handleSubmit,
    success,
    setSuccess,
    isLoading: mutation.isPending,
  };
}

