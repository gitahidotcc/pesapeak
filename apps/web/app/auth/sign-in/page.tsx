"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthForm } from "../components/auth-form";
import { SocialAuth } from "../components/social-auth";
import { useSignInMutation } from "../hooks/use-auth-mutations";
import { signInSchema } from "../validations/auth";
import type { SignInFormData } from "../validations/auth";

export default function SignInPage() {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});

  const signInMutation = useSignInMutation();

  const handleInputChange = (field: keyof SignInFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod
      const validatedData = signInSchema.parse(formData);
      setErrors({});
      
      // Submit mutation
      await signInMutation.mutateAsync(validatedData);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation errors
        const zodErrors = error as any;
        const fieldErrors: Partial<SignInFormData> = {};
        zodErrors.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0] as keyof SignInFormData] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const footer = (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange("rememberMe", !!checked)}
          />
          <Label htmlFor="remember-me">Remember me</Label>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-primary hover:text-primary/80"
        >
          Forgot password?
        </Link>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      </div>

      <SocialAuth onGoogleSignIn={() => console.log("Google sign in")} />
    </div>
  );

  return (
    <AuthForm
      title="Welcome back"
      description="Sign in to your PesaPeak account"
      onSubmit={handleSubmit}
      submitText="Sign in"
      isLoading={signInMutation.isPending}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>
      </div>
    </AuthForm>
  );
}
