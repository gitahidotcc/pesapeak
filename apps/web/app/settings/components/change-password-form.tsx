"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PasswordField } from "../../auth/components/password-field";
import { zChangePasswordSchema } from "@pesapeak/shared/types/users";
import type { ZChangePassword } from "@pesapeak/shared/types/users";

export function ChangePasswordForm() {
  const [formData, setFormData] = useState<ZChangePassword>({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [errors, setErrors] = useState<Partial<ZChangePassword>>({});
  const [success, setSuccess] = useState(false);

  const changePasswordMutation = api.users.changePassword.useMutation();

  const handleInputChange = (field: keyof ZChangePassword, value: string) => {
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
      const validatedData = zChangePasswordSchema.parse(formData);
      setErrors({});
      
      // Submit mutation
      await changePasswordMutation.mutateAsync({
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
      });
      
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation errors
        const zodErrors = error as any;
        const fieldErrors: Partial<ZChangePassword> = {};
        zodErrors.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0] as keyof ZChangePassword] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            Password changed successfully!
          </p>
        </div>
        <Button
          onClick={() => setSuccess(false)}
          variant="outline"
          className="w-full"
        >
          Change Password Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        id="currentPassword"
        label="Current Password"
        placeholder="Enter your current password"
        value={formData.currentPassword}
        onChange={(value) => handleInputChange("currentPassword", value)}
        error={errors.currentPassword}
        required
        autoComplete="current-password"
      />

      <PasswordField
        id="newPassword"
        label="New Password"
        placeholder="Enter your new password"
        value={formData.newPassword}
        onChange={(value) => handleInputChange("newPassword", value)}
        error={errors.newPassword}
        required
        autoComplete="new-password"
      />

      <PasswordField
        id="newPasswordConfirm"
        label="Confirm New Password"
        placeholder="Confirm your new password"
        value={formData.newPasswordConfirm}
        onChange={(value) => handleInputChange("newPasswordConfirm", value)}
        error={errors.newPasswordConfirm}
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={changePasswordMutation.isPending}
      >
        {changePasswordMutation.isPending ? "Changing password..." : "Change Password"}
      </Button>
    </form>
  );
}
