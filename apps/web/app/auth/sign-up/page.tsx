"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthForm } from "../components/auth-form";
import { PasswordField } from "../components/password-field";
import { SocialAuth } from "../components/social-auth";
import { useSignUpForm } from "../hooks/use-sign-up-form";
import { useServerConfig } from "@/lib/hooks/use-server-config";

export default function SignUpPage() {
  const { auth } = useServerConfig();
  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    isLoading,
  } = useSignUpForm();

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
      isLoading={isLoading}
      footer={footer}
    >
      {auth.disableSignups && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Registration is currently disabled. This is a single-user system and an account may already exist.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
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
            onChange={(e) => updateField("email", e.target.value)}
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
          onChange={(value) => updateField("password", value)}
          error={errors.password}
          required
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />
      </div>
    </AuthForm>
  );
}
