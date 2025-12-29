import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { categories, categoryFolders } from "@pesapeak/db/schema";
import { authedProcedure, router } from "../index";

const categoryOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  folderId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const folderOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  categories: z.array(categoryOutputSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createFolderInputSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

const updateFolderInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Folder name is required").max(100).optional(),
  icon: z.string().min(1, "Icon is required").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
});

const createCategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  folderId: z.string().min(1, "Folder ID is required"),
});

const updateCategoryInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required").max(100).optional(),
  icon: z.string().min(1, "Icon is required").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
});

export const categoriesRouter = router({
  list: authedProcedure.output(z.array(folderOutputSchema)).query(async ({ ctx }) => {
    const folders = await ctx.db.query.categoryFolders.findMany({
      where: eq(categoryFolders.userId, ctx.user.id),
      orderBy: (folder) => desc(folder.createdAt),
      with: {
        categories: {
          orderBy: (category) => desc(category.createdAt),
        },
      },
    });

    return folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      icon: folder.icon,
      color: folder.color,
      categories: folder.categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        folderId: category.folderId,
        createdAt: new Date(category.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(category.updatedAt ?? Date.now()).toISOString(),
      })),
      createdAt: new Date(folder.createdAt ?? Date.now()).toISOString(),
      updatedAt: new Date(folder.updatedAt ?? Date.now()).toISOString(),
    }));
  }),

  createFolder: authedProcedure
    .input(createFolderInputSchema)
    .output(folderOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const [newFolder] = await ctx.db
        .insert(categoryFolders)
        .values({
          userId: ctx.user.id,
          name: input.name,
          icon: input.icon,
          color: input.color,
        })
        .returning();

      if (!newFolder) {
        throw new Error("Failed to create folder");
      }

      return {
        id: newFolder.id,
        name: newFolder.name,
        icon: newFolder.icon,
        color: newFolder.color,
        categories: [],
        createdAt: new Date(newFolder.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(newFolder.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  updateFolder: authedProcedure
    .input(updateFolderInputSchema)
    .output(folderOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingFolder = await ctx.db.query.categoryFolders.findFirst({
        where: and(
          eq(categoryFolders.id, input.id),
          eq(categoryFolders.userId, ctx.user.id)
        ),
      });

      if (!existingFolder) {
        throw new Error("Folder not found or you don't have permission to update it");
      }

      const [updatedFolder] = await ctx.db
        .update(categoryFolders)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color !== undefined && { color: input.color }),
        })
        .where(eq(categoryFolders.id, input.id))
        .returning();

      if (!updatedFolder) {
        throw new Error("Failed to update folder");
      }

      // Fetch categories for the folder
      const folderCategories = await ctx.db.query.categories.findMany({
        where: eq(categories.folderId, updatedFolder.id),
        orderBy: (category) => desc(category.createdAt),
      });

      return {
        id: updatedFolder.id,
        name: updatedFolder.name,
        icon: updatedFolder.icon,
        color: updatedFolder.color,
        categories: folderCategories.map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          folderId: category.folderId,
          createdAt: new Date(category.createdAt ?? Date.now()).toISOString(),
          updatedAt: new Date(category.updatedAt ?? Date.now()).toISOString(),
        })),
        createdAt: new Date(updatedFolder.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(updatedFolder.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  deleteFolder: authedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingFolder = await ctx.db.query.categoryFolders.findFirst({
        where: and(
          eq(categoryFolders.id, input.id),
          eq(categoryFolders.userId, ctx.user.id)
        ),
      });

      if (!existingFolder) {
        throw new Error("Folder not found or you don't have permission to delete it");
      }

      // Categories will be deleted automatically due to cascade
      await ctx.db
        .delete(categoryFolders)
        .where(eq(categoryFolders.id, input.id));

      return { success: true };
    }),

  createCategory: authedProcedure
    .input(createCategoryInputSchema)
    .output(categoryOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify folder ownership
      const folder = await ctx.db.query.categoryFolders.findFirst({
        where: and(
          eq(categoryFolders.id, input.folderId),
          eq(categoryFolders.userId, ctx.user.id)
        ),
      });

      if (!folder) {
        throw new Error("Folder not found or you don't have permission to add categories to it");
      }

      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          userId: ctx.user.id,
          folderId: input.folderId,
          name: input.name,
          icon: input.icon,
          color: input.color,
        })
        .returning();

      if (!newCategory) {
        throw new Error("Failed to create category");
      }

      return {
        id: newCategory.id,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        folderId: newCategory.folderId,
        createdAt: new Date(newCategory.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(newCategory.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  updateCategory: authedProcedure
    .input(updateCategoryInputSchema)
    .output(categoryOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCategory = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.id),
          eq(categories.userId, ctx.user.id)
        ),
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to update it");
      }

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color !== undefined && { color: input.color }),
        })
        .where(eq(categories.id, input.id))
        .returning();

      if (!updatedCategory) {
        throw new Error("Failed to update category");
      }

      return {
        id: updatedCategory.id,
        name: updatedCategory.name,
        icon: updatedCategory.icon,
        color: updatedCategory.color,
        folderId: updatedCategory.folderId,
        createdAt: new Date(updatedCategory.createdAt ?? Date.now()).toISOString(),
        updatedAt: new Date(updatedCategory.updatedAt ?? Date.now()).toISOString(),
      };
    }),

  deleteCategory: authedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCategory = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.id),
          eq(categories.userId, ctx.user.id)
        ),
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to delete it");
      }

      await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id));

      return { success: true };
    }),

  getCategoryTransactionCount: authedProcedure
    .input(z.object({ categoryId: z.string() }))
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const existingCategory = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.categoryId),
          eq(categories.userId, ctx.user.id)
        ),
      });

      if (!existingCategory) {
        throw new Error("Category not found or you don't have permission to access it");
      }

      // TODO: When transactions table is added, count transactions for this category
      // For now, return 0
      return { count: 0 };
    }),
});

