"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForgotPasswordMutation } from "../hooks/use-auth-mutations";
import { forgotPasswordSchema } from "../validations/auth";
import type { ForgotPasswordFormData } from "../validations/auth";

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [success, setSuccess] = useState(false);

  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleInputChange = (value: string) => {
    setFormData({ email: value });
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod
      const validatedData = forgotPasswordSchema.parse(formData);
      setErrors({});
      
      // Submit mutation
      await forgotPasswordMutation.mutateAsync(validatedData);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation errors
        const zodErrors = error as any;
        const fieldErrors: Partial<ForgotPasswordFormData> = {};
        zodErrors.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0] as keyof ForgotPasswordFormData] = issue.message;
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? "Sending reset link..." : "Send reset link"}
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
