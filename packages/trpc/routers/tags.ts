import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import { tags, transactionTags } from "@pesapeak/db/schema";
import { router, authedProcedure } from "../index";

export const tagsRouter = router({
    getAll: authedProcedure.query(async ({ ctx }) => {
        const result = await ctx.db
            .select({
                id: tags.id,
                name: tags.name,
                type: tags.type,
                usageCount: sql<number>`count(${transactionTags.tagId})`.mapWith(Number),
            })
            .from(tags)
            .leftJoin(transactionTags, eq(tags.id, transactionTags.tagId))
            .where(eq(tags.userId, ctx.user.id))
            .groupBy(tags.id);

        return result;
    }),

    create: authedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                type: z.enum(["context", "frequency", "emotion", "other"]).default("other"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check for existing tag with same name for this user
            const existing = await ctx.db.query.tags.findFirst({
                where: and(eq(tags.userId, ctx.user.id), eq(tags.name, input.name)),
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Tag with this name already exists",
                });
            }

            await ctx.db.insert(tags).values({
                userId: ctx.user.id,
                name: input.name,
                type: input.type,
            });

            return { success: true };
        }),

    update: authedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1),
                type: z.enum(["context", "frequency", "emotion", "other"]).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const tag = await ctx.db.query.tags.findFirst({
                where: and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)),
            });

            if (!tag) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag not found",
                });
            }

            // Check name uniqueness if changing name
            if (input.name !== tag.name) {
                const existing = await ctx.db.query.tags.findFirst({
                    where: and(eq(tags.userId, ctx.user.id), eq(tags.name, input.name)),
                });

                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Tag with this name already exists",
                    });
                }
            }

            await ctx.db
                .update(tags)
                .set({
                    name: input.name,
                    type: input.type || tag.type,
                })
                .where(eq(tags.id, input.id));

            return { success: true };
        }),

    delete: authedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const tag = await ctx.db.query.tags.findFirst({
                where: and(eq(tags.id, input.id), eq(tags.userId, ctx.user.id)),
            });

            if (!tag) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag not found",
                });
            }

            await ctx.db.delete(tags).where(eq(tags.id, input.id));
            return { success: true };
        }),
});
