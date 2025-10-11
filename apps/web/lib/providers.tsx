"use client";

import React, { useState } from "react";
import type { UserLocalSettings } from "@/lib/user-local-settings/types";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserLocalSettingsCtx } from "@/lib/user-local-settings/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";
import type { ClientConfig } from "@pesapeak/shared/config";
import { ClientConfigCtx } from "./client-config";
import CustomI18nextProvider from "./i18n/provider";
import { api } from "./trpc";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({
  children,
  clientConfig,
  userLocalSettings,
}: {
  children: React.ReactNode;
  clientConfig: ClientConfig;
  userLocalSettings: UserLocalSettings;
}) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: `/api/trpc`,
          maxURLLength: 14000,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <ClientConfigCtx.Provider value={clientConfig}>
      <UserLocalSettingsCtx.Provider value={userLocalSettings}>
        <api.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <CustomI18nextProvider lang={userLocalSettings.lang}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider delayDuration={0}>
                  {children}
                </TooltipProvider>
              </ThemeProvider>
            </CustomI18nextProvider>
          </QueryClientProvider>
        </api.Provider>
      </UserLocalSettingsCtx.Provider>
    </ClientConfigCtx.Provider>
  );
}