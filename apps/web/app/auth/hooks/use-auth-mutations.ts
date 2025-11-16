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
        // Create error with more context
        const error = new Error(result.error.message || "Sign in failed");
        // Attach error code if available
        if (result.error.code) {
          (error as any).code = result.error.code;
        }
        throw error;
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
  const utils = api.useUtils();
  
  return useMutation({
    mutationFn: async (data: SignUpFormData) => {
      // Validate data with Zod
      const validatedData = signUpSchema.parse(data);
      
      // Check if account already exists (single-user system) using tRPC
      const accountCheck = await utils.users.checkAccountExists.fetch();
      if (accountCheck?.exists) {
        throw new Error("An account already exists. This is a single-user system. Please sign in instead.");
      }

      // Use Better Auth for sign up (creates user in Better Auth's database)
      const signUpResult = await authClient.signUp.email({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.fullName,
      });

      if (signUpResult.error) {
        throw new Error(signUpResult.error.message || "Sign up failed");
      }

      // Auto sign in after successful sign up
      const signInResult = await authClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (signInResult.error) {
        throw new Error(signInResult.error.message || "Auto sign-in failed. Please sign in manually.");
      }

      return { success: true, user: signUpResult.data?.user };
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
  return useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      // Validate data with Zod
      const validatedData = forgotPasswordSchema.parse(data);
      
      // Use Better Auth's requestPasswordReset
      const result = await authClient.requestPasswordReset({
        email: validatedData.email,
        redirectTo: `${window.location.origin}/auth/reset-password?token=`,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to send password reset email");
      }

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
  
  return useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      // Validate data with Zod
      const validatedData = resetPasswordSchema.parse(data);
      
      // Use Better Auth's resetPassword
      const result = await authClient.resetPassword({
        token: validatedData.token,
        newPassword: validatedData.password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to reset password");
      }

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
