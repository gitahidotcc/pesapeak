"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import type { Folder, Category } from "../types/categories";

// Helper to convert API response to Folder type
function convertApiFolderToFolder(apiFolder: {
    id: string;
    name: string;
    icon: string;
    color: string;
    categories: Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        folderId: string;
        createdAt: string;
        updatedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}): Folder {
    return {
        id: apiFolder.id,
        name: apiFolder.name,
        icon: apiFolder.icon,
        color: apiFolder.color,
        categories: apiFolder.categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            folderId: cat.folderId,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
        })),
        createdAt: new Date(apiFolder.createdAt),
        updatedAt: new Date(apiFolder.updatedAt),
    };
}

export function useCategories() {
    const utils = api.useUtils();
    const { data: foldersData, isLoading } = api.categories.list.useQuery();

    const folders: Folder[] = foldersData?.map(convertApiFolderToFolder) ?? [];

    const updateFolderMutation = api.categories.updateFolder.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Folder updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update folder");
        },
    });

    const deleteFolderMutation = api.categories.deleteFolder.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Folder deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete folder");
        },
    });

    const createCategoryMutation = api.categories.createCategory.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Category added successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add category");
        },
    });

    const updateCategoryMutation = api.categories.updateCategory.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Category updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update category");
        },
    });

    const deleteCategoryMutation = api.categories.deleteCategory.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Category deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete category");
        },
    });

    const createFolderMutation = api.categories.createFolder.useMutation({
        onSuccess: () => {
            utils.categories.list.invalidate();
            toast.success("Folder created successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create folder");
        },
    });

    const createFolder = useCallback(
        (data: { name: string; icon: string; color: string }) => {
            createFolderMutation.mutate(data);
        },
        [createFolderMutation]
    );

    const editFolder = useCallback(
        (folder: Folder, data: { name: string; icon: string; color: string }) => {
            updateFolderMutation.mutate({
                id: folder.id,
                ...data,
            });
        },
        [updateFolderMutation]
    );

    const deleteFolder = useCallback(
        (folder: Folder) => {
            deleteFolderMutation.mutate({ id: folder.id });
        },
        [deleteFolderMutation]
    );

    const addCategory = useCallback(
        (folderId: string, data: { name: string; icon: string; color: string }) => {
            createCategoryMutation.mutate({
                folderId,
                ...data,
            });
        },
        [createCategoryMutation]
    );

    const editCategory = useCallback(
        (category: Category, data: { name: string; icon: string; color: string }) => {
            updateCategoryMutation.mutate({
                id: category.id,
                ...data,
            });
        },
        [updateCategoryMutation]
    );

    const deleteCategory = useCallback(
        (category: Category) => {
            deleteCategoryMutation.mutate({ id: category.id });
        },
        [deleteCategoryMutation]
    );

    return {
        folders,
        isLoading,
        createFolder,
        editFolder,
        deleteFolder,
        addCategory,
        editCategory,
        deleteCategory,
    };
}

