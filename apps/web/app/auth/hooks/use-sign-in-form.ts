import { useState } from "react";
import { useAuthForm } from "./use-auth-form";
import { useSignInMutation } from "./use-auth-mutations";
import { signInSchema, type SignInFormData } from "../validations/auth";

const initialFormData: SignInFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

export function useSignInForm() {
  const form = useAuthForm(initialFormData, signInSchema);
  const mutation = useSignInMutation();
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
      if (err instanceof Error) {
        const errorMessage = err.message;
        const errorCode = (err as any).code;
        
        // Map error codes and messages to user-friendly messages
        if (errorCode === "INVALID_EMAIL_OR_PASSWORD" || 
            errorMessage.includes("Invalid email or password") || 
            errorMessage.includes("INVALID_EMAIL_OR_PASSWORD")) {
          setError("The email or password you entered is incorrect. Please check your credentials and try again.");
        } else if (errorCode === "EMAIL_NOT_VERIFIED" || 
                   errorMessage.includes("EMAIL_NOT_VERIFIED") || 
                   errorMessage.includes("email not verified")) {
          setError("Please verify your email address before signing in. Check your inbox for a verification link.");
        } else if (errorCode === "ACCOUNT_LOCKED" || 
                   errorMessage.includes("ACCOUNT_LOCKED") || 
                   errorMessage.includes("account locked")) {
          setError("Your account has been locked. Please contact support for assistance.");
        } else if (errorCode === "TOO_MANY_REQUESTS" || 
                   errorMessage.includes("TOO_MANY_REQUESTS") || 
                   errorMessage.includes("rate limit")) {
          setError("Too many sign-in attempts. Please wait a few minutes before trying again.");
        } else if (errorCode === "USER_NOT_FOUND" || 
                   errorMessage.includes("USER_NOT_FOUND") || 
                   errorMessage.includes("user not found")) {
          setError("No account found with this email address. Please check your email or sign up for a new account.");
        } else {
          // Use the error message if it's user-friendly, otherwise show a generic message
          const isUserFriendly = errorMessage && 
            !errorMessage.includes("Error:") && 
            !errorMessage.includes("Failed") &&
            errorMessage.length < 100;
          
          setError(isUserFriendly 
            ? errorMessage 
            : "An error occurred during sign in. Please check your credentials and try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Clear error when user starts typing
  const updateField = (field: keyof SignInFormData, value: string | boolean) => {
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

