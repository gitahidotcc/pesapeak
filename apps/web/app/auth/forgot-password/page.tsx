"use client";

import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";
import { useSmtpConfig } from "@/lib/hooks/use-server-config";

export default function ForgotPasswordPage() {
  const { isSmtpConfigured } = useSmtpConfig();
  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    success,
    setSuccess,
    isLoading,
  } = useForgotPasswordForm();

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <span className="font-medium">{formData.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                className="font-medium text-primary hover:text-primary/80"
              >
                try again
              </button>
            </p>
          </div>

          <div className="text-center">
            <Link href="/auth/sign-in" className="text-primary hover:text-primary/80">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Forgot your password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSmtpConfigured && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Password reset via email is not available. SMTP email service is not configured. 
              Please use the Change Password feature in settings if you're already signed in.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              disabled={!isSmtpConfigured}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isSmtpConfigured}
          >
            {isLoading ? "Sending reset link..." : "Send reset link"}
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
