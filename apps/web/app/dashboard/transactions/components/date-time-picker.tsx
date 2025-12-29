"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date: string;
  time: string;
  includeTime: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onIncludeTimeChange: (include: boolean) => void;
  dateError?: string;
  timeError?: string;
}

export function DateTimePicker({
  date,
  time,
  includeTime,
  onDateChange,
  onTimeChange,
  onIncludeTimeChange,
  dateError,
  timeError,
}: DateTimePickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              dateError && "border-destructive"
            )}
            required
          />
        </div>
        {dateError && <p className="mt-1 text-xs text-destructive">{dateError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="include-time"
          type="checkbox"
          checked={includeTime}
          onChange={(e) => {
            onIncludeTimeChange(e.target.checked);
            if (!e.target.checked) {
              onTimeChange("");
            }
          }}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
        />
        <label
          htmlFor="include-time"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Include time
        </label>
      </div>

      {includeTime && (
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                timeError && "border-destructive"
              )}
            />
          </div>
          {timeError && <p className="mt-1 text-xs text-destructive">{timeError}</p>}
        </div>
      )}
    </div>
  );
}

