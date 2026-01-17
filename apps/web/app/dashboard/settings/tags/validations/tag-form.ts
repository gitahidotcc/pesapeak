import { z } from "zod";

export const tagFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["context", "frequency", "emotion", "other"]),
});

export type TagFormData = z.infer<typeof tagFormSchema>;
