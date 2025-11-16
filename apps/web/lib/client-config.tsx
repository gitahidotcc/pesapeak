import { createContext, useContext } from "react";

import type { ClientConfig } from "@pesapeak/shared/config";

export const ClientConfigCtx = createContext<ClientConfig>({
  publicUrl: "",
  publicApiUrl: "",
  demoMode: undefined,
  auth: {
    disableSignups: false,
    disablePasswordAuth: false,
  },
  email: {
    smtpConfigured: false,
  },
  inference: {
    isConfigured: false,
    inferredTagLang: "english",
  },
  serverVersion: undefined,
  disableNewReleaseCheck: true,
});

export function useClientConfig() {
  return useContext(ClientConfigCtx);
}
