"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function RapidReviewControlToggle({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <button
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-muted"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="font-semibold text-foreground">{label}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-border p-3">{children}</div> : null}
    </div>
  );
}
