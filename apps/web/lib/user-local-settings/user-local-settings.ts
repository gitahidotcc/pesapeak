"use server";

import { cookies } from "next/headers";
import { defaultUserLocalSettings, parseUserLocalSettings, USER_LOCAL_SETTINGS_COOKIE_NAME, UserLocalSettings } from "./types";


export async function getUserLocalSettings(): Promise<UserLocalSettings> {
    const userSettings = (await cookies()).get(USER_LOCAL_SETTINGS_COOKIE_NAME);
    return (
      parseUserLocalSettings(userSettings?.value) ?? defaultUserLocalSettings()
    );
  }
  

  export async function updateInterfaceLang(lang: string) {
    const userSettings = (await cookies()).get(USER_LOCAL_SETTINGS_COOKIE_NAME);
    const parsed = parseUserLocalSettings(userSettings?.value);
    (await cookies()).set({
      name: USER_LOCAL_SETTINGS_COOKIE_NAME,
      value: JSON.stringify({ ...parsed, lang }),
      maxAge: 34560000, // Chrome caps max age to 400 days
      sameSite: "lax",
    });
  }