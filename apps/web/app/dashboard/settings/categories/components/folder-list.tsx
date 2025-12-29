"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FolderItem } from "./folder-item";
import { CreateFolderDialog } from "./create-folder-dialog";
import { AddCategoryStandaloneDialog } from "./add-category-standalone-dialog";
import { useCategories } from "../hooks/use-categories";
import type { Folder, Category } from "../types/categories";

export function FolderList() {
    const { folders, isLoading, createFolder, editFolder, deleteFolder, addCategory, editCategory, deleteCategory } = useCategories();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter folders and categories based on search query
    const filteredFolders = useMemo(() => {
        if (!folders) return [];
        if (!searchQuery.trim()) return folders;

        const query = searchQuery.toLowerCase().trim();
        return folders
            .map((folder) => {
                const folderMatches = folder.name.toLowerCase().includes(query);
                const matchingCategories = folder.categories.filter((category) =>
                    category.name.toLowerCase().includes(query)
                );

                // Include folder if folder name matches or if it has matching categories
                if (folderMatches || matchingCategories.length > 0) {
                    return {
                        ...folder,
                        categories: folderMatches ? folder.categories : matchingCategories,
                    };
                }
                return null;
            })
            .filter((folder): folder is Folder => folder !== null);
    }, [folders, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-64 animate-pulse rounded-2xl bg-muted/40"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Action buttons at the top */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search folders or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <CreateFolderDialog onCreate={createFolder} />
                    <AddCategoryStandaloneDialog folders={folders} onAdd={addCategory} />
                </div>
            </div>

            {!folders || folders.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40">
                            <svg
                                className="h-8 w-8 text-muted-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            No folders yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Create your first folder to start organizing your categories.
                        </p>
                    </div>
                </div>
            ) : filteredFolders.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            No results found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your search query.
                        </p>
                    </div>
                </div>
            ) : (
                filteredFolders.map((folder) => (
                    <FolderItem
                        key={folder.id}
                        folder={folder}
                        searchQuery={searchQuery}
                        onEditFolder={editFolder}
                        onDeleteFolder={deleteFolder}
                        onAddCategory={addCategory}
                        onEditCategory={editCategory}
                        onDeleteCategory={deleteCategory}
                    />
                ))
            )}
        </div>
    );
}

