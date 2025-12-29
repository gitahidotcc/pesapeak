import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100, "Folder name is too long"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

export const updateFolderSchema = createFolderSchema.extend({
  id: z.string().min(1, "Folder ID is required"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name is too long"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  folderId: z.string().min(1, "Folder ID is required"),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

