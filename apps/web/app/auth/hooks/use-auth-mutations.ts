import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { authClient } from "@/lib/auth-client";
import { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth";
import type { 
  SignInFormData, 
  SignUpFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData 
} from "../validations/auth";

// Sign In Mutation
export function useSignInMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: SignInFormData) => {
      // Validate data with Zod
      const validatedData = signInSchema.parse(data);
      
      // Use Better Auth for sign in
      const result = await authClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password,
        rememberMe: validatedData.rememberMe,
      });

      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }

      return { success: true, user: result.data?.user };
    },
    onSuccess: () => {
      // Redirect to dashboard on successful sign in
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Sign in failed:", error);
    },
  });
}

// Sign Up Mutation
export function useSignUpMutation() {
  const router = useRouter();
  const createUserMutation = api.users.create.useMutation();
  
  return useMutation({
    mutationFn: async (data: SignUpFormData) => {
      // Validate data with Zod
      const validatedData = signUpSchema.parse(data);
      
      // Use tRPC for user creation (enforces single-user check)
      const user = await createUserMutation.mutateAsync({
        name: validatedData.fullName,
        email: validatedData.email,
        password: validatedData.password,
        confirmPassword: validatedData.confirmPassword,
      });

      // After successful user creation, sign in with Better Auth
      const signInResult = await authClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (signInResult.error) {
        throw new Error(signInResult.error.message || "Auto sign-in failed");
      }

      return { success: true, user };
    },
    onSuccess: () => {
      // Redirect to dashboard on successful sign up
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });
}

// Forgot Password Mutation
export function useForgotPasswordMutation() {
  const forgotPasswordMutation = api.users.forgotPassword.useMutation();
  
  return useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      // Validate data with Zod
      const validatedData = forgotPasswordSchema.parse(data);
      
      // Use tRPC for forgot password
      await forgotPasswordMutation.mutateAsync({
        email: validatedData.email,
      });
      
      return { success: true, message: "Reset link sent to your email" };
    },
    onSuccess: (data) => {
      console.log("Forgot password successful:", data);
    },
    onError: (error) => {
      console.error("Forgot password failed:", error);
    },
  });
}

// Reset Password Mutation
export function useResetPasswordMutation() {
  const router = useRouter();
  const resetPasswordMutation = api.users.resetPassword.useMutation();
  
  return useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      // Validate data with Zod
      const validatedData = resetPasswordSchema.parse(data);
      
      // Use tRPC for reset password
      await resetPasswordMutation.mutateAsync({
        token: validatedData.token,
        newPassword: validatedData.password,
      });
      
      return { success: true, message: "Password reset successfully" };
    },
    onSuccess: () => {
      // Redirect to sign in page on successful reset
      router.push("/auth/sign-in");
    },
    onError: (error) => {
      console.error("Reset password failed:", error);
    },
  });
}
