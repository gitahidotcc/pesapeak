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
      console.error("Sign up error:", error);
    }
  };

  return {
    ...form,
    mutation,
    handleSubmit,
    isLoading: mutation.isPending,
  };
}

