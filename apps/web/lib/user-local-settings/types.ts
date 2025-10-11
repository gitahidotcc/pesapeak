import { z } from "zod";

export const USER_LOCAL_SETTINGS_COOKIE_NAME = "pesapeak-user-local-settings";


export const zUserLocalSettings = z.object({
  lang: z.string().optional().default("en"),
});

export type UserLocalSettings = z.infer<typeof zUserLocalSettings>;

export function parseUserLocalSettings(str: string | undefined) {
  try {
    return zUserLocalSettings.parse(JSON.parse(str ?? "{}"));
  } catch {
    return undefined;
  }
}

export function defaultUserLocalSettings() {
  return zUserLocalSettings.parse({});
}
