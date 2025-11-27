"use client";

import { BackButton } from "@/components/ui/back-button";
import { AccountList } from "./components/account-list";
import { CreateAccountForm } from "./components/create-account-form";

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between pl-12 relative">
        <BackButton
          href="/dashboard/settings"
          className="absolute left-0 top-1/2 -translate-y-1/2"
          aria-label="Back to settings"
        />
        <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
        <CreateAccountForm />
      </header>

      <AccountList />
    </div>
  );
}
