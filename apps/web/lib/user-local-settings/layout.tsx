"use client";

import type { z } from "zod";
import { createContext, useContext } from "react";
import { fallbackLng } from "@/lib/i18n/settings";

import type { zUserLocalSettings } from "./types";


export const UserLocalSettingsCtx = createContext<
  z.infer<typeof zUserLocalSettings>
>({
  lang: fallbackLng,
});

function useUserLocalSettings() {
  return useContext(UserLocalSettingsCtx);
}



export function useInterfaceLang() {
  const settings = useUserLocalSettings();
  return settings.lang;
}
