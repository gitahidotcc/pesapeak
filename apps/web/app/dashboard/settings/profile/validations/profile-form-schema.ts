"use client";

import { z } from "zod";
import { supportedLangs } from "@pesapeak/shared/langs";

export const timezoneChoices = (() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl && typeof Intl.supportedValuesOf === "function") {
        return Intl.supportedValuesOf("timeZone");
    }

    return ["UTC"];
})();

export const profileFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    timezone: z.string().min(1, { message: "Timezone is required" }),
    language: z.enum(supportedLangs as [string, ...string[]]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

