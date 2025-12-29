import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "@pesapeak/db/schema";
import { authedProcedure, router } from "../index";

export const onboardingRouter = router({
    complete: authedProcedure.mutation(async ({ ctx }) => {
        await ctx.db
            .update(users)
            .set({ isOnboarded: true })
            .where(eq(users.id, ctx.user.id));

        return { success: true };
    }),

    updateStep: authedProcedure
        .input(z.object({ step: z.number() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(users)
                .set({ onboardingStep: input.step })
                .where(eq(users.id, ctx.user.id));

            return { success: true };
        }),
});
