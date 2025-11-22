"use client";

import { Plus } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}

export function FloatingActionButton({
  onClick,
  className,
  "aria-label": ariaLabel = "Add",
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon-lg"
      className={cn(
        "fixed bottom-24 right-6 z-[60] h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl lg:bottom-8 lg:right-8",
        className
      )}
      aria-label={ariaLabel}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}

