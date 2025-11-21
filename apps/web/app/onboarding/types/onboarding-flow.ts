export type OnboardingStepDefinition = {
  id: string;
  title: string;
  description: string;
};

export type OnboardingAccount = {
  id: string;
  name: string;
  type: string;
  balance: string;
  detail: string;
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

export type OnboardingContext = {
  heroAccounts: OnboardingAccount[];
  importHistory: OnboardingImport[];
  categories: OnboardingCategory[];
  reviewItems: OnboardingReviewItem[];
};

