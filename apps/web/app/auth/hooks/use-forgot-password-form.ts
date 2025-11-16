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
      // Always show success message for security (don't reveal if email exists)
      // Backend always returns success even if user doesn't exist to prevent email enumeration
      setSuccess(true);
    } catch (error) {
      // Log the error for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Forgot password error:", {
        error,
        message: errorMessage,
      });
      
      // Only show success if it's not an SMTP/email configuration error
      // SMTP errors should be visible to the user since they indicate a server configuration issue
      if (errorMessage.includes("Email service is not configured") || 
          errorMessage.includes("SMTP") ||
          errorMessage.includes("connection failed") ||
          errorMessage.includes("Failed to send")) {
        // Don't show success for SMTP errors - these are server configuration issues
        // The form is already disabled if SMTP is not configured, but we should still handle runtime errors
        throw error; // Re-throw to let the UI handle it
      } else {
        // For other errors (including user not found), show success to prevent enumeration
        setSuccess(true);
      }
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

