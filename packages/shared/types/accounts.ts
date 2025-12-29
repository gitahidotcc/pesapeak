import { z } from "zod";

export const ACCOUNT_TYPES = [
  "savings",
  "credit-card",
  "current",
  "mobile-money",
  "cash",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const zAccountTypeSchema = z.enum(ACCOUNT_TYPES);

