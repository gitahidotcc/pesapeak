"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthForm } from "../components/auth-form";
import { PasswordField } from "../components/password-field";
import { SocialAuth } from "../components/social-auth";
import { useSignUpMutation } from "../hooks/use-auth-mutations";
import { signUpSchema } from "../validations/auth";
import type { SignUpFormData } from "../validations/auth";

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  const signUpMutation = useSignUpMutation();

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
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
      const validatedData = signUpSchema.parse(formData);
      setErrors({});
      
      // Submit mutation
      await signUpMutation.mutateAsync(validatedData);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation errors
        const zodErrors = error as any;
        const fieldErrors: Partial<SignUpFormData> = {};
        zodErrors.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0] as keyof SignUpFormData] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const footer = (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>

      <SocialAuth onGoogleSignIn={() => console.log("Google sign up")} />
    </div>
  );

  return (
    <AuthForm
      title="Create your account"
      onSubmit={handleSubmit}
      submitText="Create account"
      isLoading={signUpMutation.isPending}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            required
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

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

        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(value) => handleInputChange("password", value)}
          error={errors.password}
          required
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange("confirmPassword", value)}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />
      </div>
    </AuthForm>
  );
}
