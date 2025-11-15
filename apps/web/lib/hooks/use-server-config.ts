"use client";

import { clientConfig } from "@pesapeak/shared/config";

/**
 * Hook to check server configuration, particularly SMTP availability
 */
export function useServerConfig() {
  return {
    smtpConfigured: clientConfig.email.smtpConfigured,
    emailVerificationRequired: clientConfig.email.emailVerificationRequired,
    auth: clientConfig.auth,
  };
}

/**
 * Hook specifically for checking SMTP configuration
 */
export function useSmtpConfig() {
  const config = useServerConfig();
  
  return {
    isSmtpConfigured: config.smtpConfigured,
    emailVerificationRequired: config.emailVerificationRequired,
  };
}
