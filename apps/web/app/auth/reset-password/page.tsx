"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "../components/password-field";
import { useResetPasswordMutation } from "../hooks/use-auth-mutations";
import { resetPasswordSchema } from "../validations/auth";
import type { ResetPasswordFormData } from "../validations/auth";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useResetPasswordMutation();

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string) => {
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
      const validatedData = resetPasswordSchema.parse(formData);
      setErrors({});
      
      // Submit mutation
      await resetPasswordMutation.mutateAsync(validatedData);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation errors
        const zodErrors = error as any;
        const fieldErrors: Partial<ResetPasswordFormData> = {};
        zodErrors.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0] as keyof ResetPasswordFormData] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Password reset successful</CardTitle>
          <CardDescription>
            Your password has been successfully reset. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/sign-in">
            <Button className="w-full">Continue to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange("confirmPassword", value)}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? "Resetting password..." : "Reset password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}