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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { valid } = form.validate();
    if (!valid) {
      return;
    }

    try {
      await mutation.mutateAsync(form.formData);
    } catch (error) {
      // Errors are handled by the mutation and form validation
      console.error("Sign in error:", error);
    }
  };

  return {
    ...form,
    mutation,
    handleSubmit,
    isLoading: mutation.isPending,
  };
}

