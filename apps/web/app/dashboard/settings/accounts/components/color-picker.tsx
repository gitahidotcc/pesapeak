"use client";

import type { Dispatch, SetStateAction } from "react";

export type ColorOption = {
  label: string;
  value: string;
};

export type ColorGroup = {
  label: string;
  colors: ColorOption[];
};

interface ColorPickerProps {
  groups: ColorGroup[];
  selectedColor: string;
  onSelect: Dispatch<SetStateAction<string>>;
}

export function ColorPicker({ groups, selectedColor, onSelect }: ColorPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Accent color</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Visual cue</p>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.colors.map((color) => {
              const isSelected = selectedColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  className={`relative h-9 w-9 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected ? "border-primary ring-2 ring-primary/50" : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onSelect(color.value)}
                  aria-pressed={isSelected}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

