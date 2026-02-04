import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import { tags, transactionTags, transactions } from "@pesapeak/db/schema";
import { router, authedProcedure } from "../index";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

            const [newTag] = await ctx.db.insert(tags).values({
                userId: ctx.user.id,
                name: input.name,
                type: input.type,
            }).returning();

            return newTag;
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

    getAnalytics: authedProcedure
        .input(
            z.object({
                startDate: z.string().regex(dateRegex, "startDate must be YYYY-MM-DD"),
                endDate: z.string().regex(dateRegex, "endDate must be YYYY-MM-DD"),
                accountId: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            // Parse dates in UTC to avoid timezone inconsistencies (consistent with transactions utils)
            const [startY, startM, startD] = input.startDate.split("-").map(Number);
            const [endY, endM, endD] = input.endDate.split("-").map(Number);
            const startDate = new Date(Date.UTC(startY, startM - 1, startD, 0, 0, 0, 0));
            const endDate = new Date(Date.UTC(endY, endM - 1, endD, 23, 59, 59, 999));

            const conditions = [
                eq(transactions.userId, ctx.user.id),
                eq(transactions.type, "expense"),
                sql`${transactions.date} >= ${startDate.toISOString()}`,
                sql`${transactions.date} <= ${endDate.toISOString()}`,
            ];

            if (input.accountId) {
                conditions.push(eq(transactions.accountId, input.accountId));
            }

            const result = await ctx.db
                .select({
                    tagId: tags.id,
                    tagName: tags.name,
                    tagType: tags.type,
                    totalAmount: sql<number>`sum(${transactions.amount})`.mapWith(Number),
                    count: sql<number>`count(${transactions.id})`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(transactionTags, eq(transactions.id, transactionTags.transactionId))
                .innerJoin(tags, eq(transactionTags.tagId, tags.id))
                .where(and(...conditions))
                .groupBy(tags.id)
                .orderBy(sql`sum(${transactions.amount}) desc`);

            return result.filter(r => r.totalAmount > 0);
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
