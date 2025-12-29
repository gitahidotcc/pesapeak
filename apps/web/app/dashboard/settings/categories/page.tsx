"use client";

import { BackButton } from "@/components/ui/back-button";
import { FolderList } from "./components/folder-list";

const heroText = {
  headline: "Categories",
  subhead: "Organize your expenses and income by category.",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2 relative pl-12">
        <BackButton
          href="/dashboard/settings"
          className="absolute left-0 top-0"
          aria-label="Back to settings"
        />
        <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Settings</p>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{heroText.headline}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{heroText.subhead}</p>
        </div>
      </header>

      <FolderList />
    </div>
  );
}

