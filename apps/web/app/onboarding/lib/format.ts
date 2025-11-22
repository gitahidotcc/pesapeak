/**
 * Currency flag emoji mapping for common currencies
 */
export const CURRENCY_FLAG_MAP: Record<string, string> = {
  KES: "🇰🇪",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

/**
 * Format a balance amount as currency
 * Balances are stored in cents (smallest currency unit), so we divide by 100 to get the base amount
 * @param value - The amount in cents to format (can be undefined)
 * @param currency - The currency code (defaults to USD)
 * @returns Formatted currency string
 */
export function formatBalance(value: number | undefined, currency?: string): string {
  const amountInCents = typeof value === "number" ? value : 0;
  const amount = amountInCents / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency ?? "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/**
 * Format a timestamp as a localized date and time string
 * @param value - ISO timestamp string
 * @returns Formatted date/time string or "—" if invalid
 */
export function formatTimestamp(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

