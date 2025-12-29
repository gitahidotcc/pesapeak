"use client";

import type { LucideIcon } from "lucide-react";

export type IconOption = {
  label: string;
  value: string;
  Icon: LucideIcon;
};

export type IconGroup = {
  label: string;
  icons: IconOption[];
};

interface IconPickerProps {
  groups: IconGroup[];
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ groups, selectedIcon, onSelect }: IconPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Icon</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Symbol</p>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.icons.map(({ value, label, Icon }) => {
              const isSelected = selectedIcon === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-card-foreground"
                  }`}
                  onClick={() => onSelect(value)}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

