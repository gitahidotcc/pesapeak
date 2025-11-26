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
};

