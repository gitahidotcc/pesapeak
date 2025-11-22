"use client";

import { useState } from "react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { cn } from "@/lib/utils";

export function FloatingActionButtonWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FloatingActionButton
        aria-label="Add transaction"
        onClick={() => setIsOpen(true)}
        className={cn(isOpen && "hidden")}
      />
      <AddTransactionDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

