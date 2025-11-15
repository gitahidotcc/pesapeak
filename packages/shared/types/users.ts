import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

export const zSignUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name can't be empty" }),
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const zResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export const zChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).max(PASSWORD_MAX_LENGTH),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords don't match",
    path: ["newPasswordConfirm"],
  });

export const zWhoAmIResponseSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  localUser: z.boolean(),
});


export const zUserSettingsSchema = z.object({
  timezone: z.string(),
});

export type ZUserSettings = z.infer<typeof zUserSettingsSchema>;

export const zUpdateUserSettingsSchema = zUserSettingsSchema.partial().pick({
  timezone: true,
});

export type ZChangePassword = z.infer<typeof zChangePasswordSchema>;
