import type { AccountType } from "@pesapeak/shared/types/accounts";

export type OnboardingStepDefinition = {
  id: string;
  title: string;
  description: string;
};

export type OnboardingAccount = {
  id: string;
  name: string;
  accountType: AccountType;
  currency: string;
  color: string;
  icon: string;
  notes: string;
  initialBalance: number;
  totalBalance: number;
  defaultAccount: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingImport = {
  id: string;
  account: string;
  fileName: string;
  importedAt: string;
  status: string;
};

export type OnboardingCategory = {
  id: string;
  name: string;
  description: string;
  confidence: string;
};

export type OnboardingReviewItem = {
  id: string;
  merchant: string;
  amount: string;
  guessedCategory: string;
  date: string;
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  savings: "Savings Account",
  "credit-card": "Credit Card",
  current: "Current Account",
  "mobile-money": "Mobile Money",
  cash: "Cash",
};

export type OnboardingContext = {
  accounts: OnboardingAccount[];
  accountsLoading: boolean;
  importHistory: OnboardingImport[];
  categories: OnboardingCategory[];
  reviewItems: OnboardingReviewItem[];
};

