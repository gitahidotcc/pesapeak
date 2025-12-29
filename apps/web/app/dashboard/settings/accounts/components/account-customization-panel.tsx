"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Coins,
  LucideIcon,
  PiggyBank,
  Wallet,
} from "lucide-react";

import { ColorPicker, type ColorGroup } from "./color-picker";
import { CurrencyPicker, type CurrencyGroup } from "./currency-picker";
import { IconPicker, type IconGroup } from "./icon-picker";

const DEFAULT_COLOR = "#222222";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_ICON = "banknote";

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Classic",
    colors: [
      { label: "Night", value: "#0f172a" },
      { label: "Midnight", value: "#1d1d1f" },
      { label: "Graphite", value: DEFAULT_COLOR },
    ],
  },
  {
    label: "Accent",
    colors: [
      { label: "Serene", value: "#2563eb" },
      { label: "Growth", value: "#16a34a" },
      { label: "Sunbeam", value: "#f97316" },
    ],
  },
];

const CURRENCY_GROUPS: CurrencyGroup[] = [
  {
    label: "Popular",
    options: [
      { code: "USD", label: "US Dollar", emoji: "🇺🇸" },
      { code: "EUR", label: "Euro", emoji: "🇪🇺" },
      { code: "GBP", label: "Pound", emoji: "🇬🇧" },
    ],
  },
  {
    label: "Regional",
    options: [
      { code: "KES", label: "Kenyan Shilling", emoji: "🇰🇪" },
      { code: "NGN", label: "Naira", emoji: "🇳🇬" },
      { code: "ZAR", label: "Rand", emoji: "🇿🇦" },
    ],
  },
];

const ICON_GROUPS: IconGroup[] = [
  {
    label: "Essentials",
    icons: [
      { label: "Banknote", value: "banknote", Icon: Banknote },
      { label: "Wallet", value: "wallet", Icon: Wallet },
    ],
  },
  {
    label: "Cards",
    icons: [
      { label: "Credit card", value: "credit-card", Icon: CreditCard },
      { label: "Piggy bank", value: "piggy-bank", Icon: PiggyBank },
    ],
  },
  {
    label: "Wealth",
    icons: [{ label: "Coins", value: "coins", Icon: Coins }],
  },
];

const ICON_RENDERERS: Record<string, LucideIcon> = {
  banknote: Banknote,
  wallet: Wallet,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
};

export function AccountCustomizationPanel() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);

  const SelectedIcon = ICON_RENDERERS[selectedIcon] ?? Banknote;

  const renderedIconLabel = useMemo(
    () => ICON_GROUPS.flatMap((group) => group.icons).find((icon) => icon.value === selectedIcon)?.label ?? "Icon",
    [selectedIcon],
  );

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Manage connected accounts</p>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Customize the colors, currencies, and icons that help you quickly identify each account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <ColorPicker groups={COLOR_GROUPS} selectedColor={selectedColor} onSelect={setSelectedColor} />
          <CurrencyPicker
            groups={CURRENCY_GROUPS}
            selectedCurrency={selectedCurrency}
            onSelect={setSelectedCurrency}
          />
          <IconPicker groups={ICON_GROUPS} selectedIcon={selectedIcon} onSelect={setSelectedIcon} />
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Preview</p>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {renderedIconLabel}
            </span>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
                style={{ borderColor: selectedColor }}
              >
                <SelectedIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Connected account</p>
                <p className="text-xs text-muted-foreground">Currency · {selectedCurrency}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Color</span>
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-sm text-card-foreground">{selectedColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Currency</span>
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-card-foreground">
                  {selectedCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Icon</span>
                <div className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4 text-card-foreground" />
                  <span className="text-sm text-card-foreground">{renderedIconLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

