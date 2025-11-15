"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthForm } from "../components/auth-form";
import { SocialAuth } from "../components/social-auth";
import { useSignInForm } from "../hooks/use-sign-in-form";

export default function SignInPage() {
  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    isLoading,
  } = useSignInForm();

  const footer = (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => updateField("rememberMe", !!checked)}
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
      isLoading={isLoading}
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
            onChange={(e) => updateField("email", e.target.value)}
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
            onChange={(e) => updateField("password", e.target.value)}
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
