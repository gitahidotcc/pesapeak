"use client";

export type CurrencyOption = {
  code: string;
  label: string;
  emoji: string;
};

export type CurrencyGroup = {
  label: string;
  options: CurrencyOption[];
};

interface CurrencyPickerProps {
  groups: CurrencyGroup[];
  selectedCurrency: string;
  onSelect: (currency: string) => void;
}

export function CurrencyPicker({ groups, selectedCurrency, onSelect }: CurrencyPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Currency</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Display</p>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.label}</p>
          <div className="grid grid-cols-3 gap-2">
            {group.options.map((option) => {
              const isSelected = selectedCurrency === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-card-foreground"
                  }`}
                  onClick={() => onSelect(option.code)}
                  aria-pressed={isSelected}
                >
                  <span aria-hidden>{option.emoji}</span>
                  <span>{option.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

