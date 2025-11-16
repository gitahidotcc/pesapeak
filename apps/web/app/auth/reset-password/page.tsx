"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "../components/password-field";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";

export default function ResetPasswordPage() {
  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    success,
    token,
    isLoading,
    error,
  } = useResetPasswordForm();

  // Show error if no token is provided or token is invalid
  if (!token || token === "INVALID_TOKEN") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-destructive">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
          <div className="text-center">
            <Link href="/auth/sign-in" className="text-primary hover:text-primary/80">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to reset password. Please try again."}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={(value) => updateField("password", value)}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Resetting password..." : "Reset password"}
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
