"use client";

import { BackButton } from "@/components/ui/back-button";
import { TagsList } from "./components/tags-list";
import { CreateTagDialog } from "./components/create-tag-dialog";

export default function TagsPage() {
    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between pl-12 relative">
                <BackButton
                    href="/dashboard/settings"
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    aria-label="Back to settings"
                />
                <h1 className="text-3xl font-bold text-foreground">Tags</h1>
                <CreateTagDialog />
            </header>

            <div className="max-w-3xl">
                <TagsList />
            </div>
        </div>
    );
}
